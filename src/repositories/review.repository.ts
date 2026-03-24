import { prisma } from "@/lib/prisma";

export async function getReviewsForProvider(providerProfileId: string) {
  return prisma.review.findMany({
    where: { providerProfileId, isPublished: true },
    include: { author: { select: { name: true, image: true } }, scoreBreakdown: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewsForSquad(squadId: string) {
  return prisma.review.findMany({
    where: { squadId, isPublished: true },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
}
