import { prisma } from "@/lib/prisma";

export async function findProviderByUserId(userId: string) {
  return prisma.providerProfile.findUnique({
    where: { userId },
    include: { skills: { include: { skill: true } } },
  });
}

export async function findProviderBySlug(slug: string) {
  return prisma.providerProfile.findUnique({ where: { slug } });
}

export async function createProviderProfile(userId: string, slug: string) {
  return prisma.providerProfile.create({ data: { userId, slug } });
}

export async function updateProviderProfile(id: string, data: Partial<{
  bio: string;
  tagline: string;
  mainTrade: string;
  hourlyRate: number;
  availableNow: boolean;
  serviceAreas: string[];
}>) {
  return prisma.providerProfile.update({ where: { id }, data });
}
