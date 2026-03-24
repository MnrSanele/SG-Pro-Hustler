import { prisma } from "@/lib/prisma";
import type { PortfolioProjectInput, ProviderProfileInput } from "@/schemas/provider.schema";
import type { SearchParams } from "@/types";
import { calculateProfileStrength, getProviderCredibility } from "@/services/credibility.service";

async function getProviderProfileByUserId(userId: string) {
  return prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      skills: {
        include: {
          skill: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [{ proficiencyRank: "desc" }, { createdAt: "asc" }],
      },
      portfolio: {
        include: {
          media: {
            orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
      reviews: {
        where: { isPublished: true },
        include: {
          author: { select: { name: true, image: true } },
          scoreBreakdown: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

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
      orderBy: [{ averageRating: "desc" }, { reviewCount: "desc" }],
    }),
    prisma.providerProfile.count({ where: { moderationStatus: "APPROVED" } }),
  ]);

  return { providers, total, page, limit, hasMore: skip + limit < total };
}

export async function getProviderBySlug(slug: string) {
  const provider = await prisma.providerProfile.findFirst({
    where: {
      slug,
      moderationStatus: "APPROVED",
    },
    include: {
      user: true,
      skills: { include: { skill: { include: { category: true } } } },
      portfolio: {
        where: { isPublished: true },
        include: { media: { orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }] } },
        orderBy: { sortOrder: "asc" },
      },
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

  const [completedJobsCount, credibility] = await Promise.all([
    prisma.job.count({
      where: {
        assignedProviderId: provider.userId,
        status: "COMPLETED",
      },
    }),
    getProviderCredibility(provider.id),
  ]);

  return {
    ...provider,
    completedJobsCount,
    credibility,
  };
}

export async function getProviderDashboard(userId: string) {
  const provider = await getProviderProfileByUserId(userId);

  if (!provider) {
    return null;
  }

  const credibility = await getProviderCredibility(provider.id);

  return {
    ...provider,
    credibility,
  };
}

export async function updateProviderProfileForUser(userId: string, data: ProviderProfileInput) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Provider profile not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        image: data.image || null,
        phone: data.phone || null,
      },
    });

    await tx.providerProfile.update({
      where: { id: profile.id },
      data: {
        bio: data.bio || null,
        tagline: data.tagline || null,
        mainTrade: data.mainTrade || null,
        pricingModel: data.pricingModel,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        availableNow: data.availableNow,
        emergencyAvailable: data.emergencyAvailable,
        yearsExperience: data.yearsExperience,
        serviceAreas: data.serviceAreas,
        languages: data.languages,
      },
    });

    await tx.providerSkill.deleteMany({
      where: { providerProfileId: profile.id },
    });

    if (data.selectedSkills.length > 0) {
      await tx.providerSkill.createMany({
        data: data.selectedSkills.map((selection) => ({
          providerProfileId: profile.id,
          skillId: selection.skillId,
          proficiencyRank: selection.proficiencyRank,
        })),
      });
    }

    const profileStrength = await calculateProfileStrength(profile.id, tx);

    return tx.providerProfile.update({
      where: { id: profile.id },
      data: { profileStrength },
      include: {
        user: true,
        skills: { include: { skill: { include: { category: true } } } },
      },
    });
  });
}

export async function createPortfolioProjectForUser(userId: string, data: PortfolioProjectInput) {
  const profile = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new Error("Provider profile not found");
  }

  if (data.coverIndex >= data.mediaUrls.length) {
    throw new Error("Select a valid cover image");
  }

  return prisma.$transaction(async (tx) => {
    const project = await tx.portfolioProject.create({
      data: {
        providerProfileId: profile.id,
        title: data.title,
        description: data.description || null,
        area: data.area || null,
        budgetRange: data.budgetRange || null,
        dateCompleted: data.dateCompleted,
        rolePerformed: data.rolePerformed || null,
        coverImageUrl: data.mediaUrls[data.coverIndex],
        media: {
          create: data.mediaUrls.map((url, index) => ({
            url,
            isCover: index === data.coverIndex,
            sortOrder: index,
          })),
        },
      },
      include: {
        media: true,
      },
    });

    const profileStrength = await calculateProfileStrength(profile.id, tx);

    await tx.providerProfile.update({
      where: { id: profile.id },
      data: { profileStrength },
    });

    return project;
  });
}
