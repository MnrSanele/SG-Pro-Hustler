import { prisma } from "@/lib/prisma";

export async function findSquadBySlug(slug: string) {
  return prisma.squad.findUnique({ where: { slug } });
}

export async function createSquad(data: {
  name: string;
  slug: string;
  description?: string;
  leaderId: string;
  leaderProviderProfileId?: string;
}) {
  return prisma.squad.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      members: {
        create: {
          userId: data.leaderId,
          providerProfileId: data.leaderProviderProfileId,
          role: "LEADER",
          status: "ACTIVE",
          joinedAt: new Date(),
        },
      },
    },
  });
}
