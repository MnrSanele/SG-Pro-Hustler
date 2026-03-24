import { prisma } from "@/lib/prisma";

export async function calculateProfileStrength(providerProfileId: string): Promise<number> {
  const profile = await prisma.providerProfile.findUnique({
    where: { id: providerProfileId },
    include: { skills: true, portfolio: true, verificationRecords: true, user: true },
  });

  if (!profile) return 0;

  let score = 0;

  if (profile.user.image) score += 10;
  if (profile.bio && profile.bio.length > 50) score += 15;
  if (profile.tagline) score += 5;
  if (profile.skills.length > 0) score += 15;
  if (profile.skills.length >= 3) score += 5;
  if (profile.portfolio.length > 0) score += 20;
  if (profile.serviceAreas.length > 0) score += 10;
  if (profile.hourlyRate || profile.dailyRate) score += 5;
  if (profile.yearsExperience) score += 5;
  if (profile.idVerificationStatus === "VERIFIED") score += 10;

  return Math.min(score, 100);
}
