import { prisma } from "@/lib/prisma";
import type { SearchParams } from "@/types";

export async function getProviders(params: SearchParams = {}) {
  const { page = 1, limit = 12, q, category } = params;
  const skip = (page - 1) * limit;

  const [providers, total] = await Promise.all([
    prisma.providerProfile.findMany({
      where: {
        moderationStatus: "APPROVED",
        ...(q && { user: { name: { contains: q, mode: "insensitive" } } }),
        ...(category && { skills: { some: { skill: { category: { slug: category } } } } }),
      },
      skip,
      take: limit,
      include: {
        user: { select: { name: true, image: true } },
        skills: { include: { skill: { include: { category: true } } }, take: 5 },
      },
      orderBy: { averageRating: "desc" },
    }),
    prisma.providerProfile.count({ where: { moderationStatus: "APPROVED" } }),
  ]);

  return { providers, total, page, limit, hasMore: skip + limit < total };
}

export async function getProviderBySlug(slug: string) {
  const provider = await prisma.providerProfile.findUnique({
    where: { slug },
    include: {
      user: true,
      skills: { include: { skill: { include: { category: true } } } },
      portfolio: { where: { isPublished: true }, include: { media: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isPublished: true },
        include: { author: { select: { name: true, image: true } }, scoreBreakdown: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      verificationRecords: true,
    },
  });

  if (!provider) {
    return null;
  }

  const completedJobsCount = await prisma.job.count({
    where: {
      assignedProviderId: provider.userId,
      status: "COMPLETED",
    },
  });

  return {
    ...provider,
    completedJobsCount,
  };
}
