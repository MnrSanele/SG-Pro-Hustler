import { prisma } from "@/lib/prisma";
import type { SearchParams } from "@/types";

export async function getSquads(params: SearchParams = {}) {
  const { page = 1, limit = 12 } = params;
  const skip = (page - 1) * limit;

  const [squads, total] = await Promise.all([
    prisma.squad.findMany({
      where: { moderationStatus: "APPROVED" },
      skip,
      take: limit,
      include: {
        categories: true,
        _count: { select: { members: true } },
      },
      orderBy: { averageRating: "desc" },
    }),
    prisma.squad.count({ where: { moderationStatus: "APPROVED" } }),
  ]);

  return { squads, total, page, limit, hasMore: skip + limit < total };
}

export async function getSquadBySlug(slug: string) {
  return prisma.squad.findUnique({
    where: { slug },
    include: {
      categories: true,
      members: {
        where: { status: "ACTIVE" },
        include: { user: { select: { name: true, image: true } }, providerProfile: true },
      },
      portfolio: { where: { isPublished: true } },
      reviews: {
        where: { isPublished: true },
        include: { author: { select: { name: true, image: true } } },
        take: 10,
      },
    },
  });
}
