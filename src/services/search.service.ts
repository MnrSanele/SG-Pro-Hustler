import { prisma } from "@/lib/prisma";

export interface SearchResult {
  providers: unknown[];
  jobs: unknown[];
  squads: unknown[];
}

export async function globalSearch(query: string): Promise<SearchResult> {
  const [providers, jobs, squads] = await Promise.all([
    prisma.providerProfile.findMany({
      where: {
        moderationStatus: "APPROVED",
        OR: [
          { tagline: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
          { user: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      take: 5,
      include: { user: { select: { name: true, image: true } } },
    }),
    prisma.job.findMany({
      where: {
        status: "OPEN",
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.squad.findMany({
      where: {
        moderationStatus: "APPROVED",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { tagline: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ]);

  return { providers, jobs, squads };
}
