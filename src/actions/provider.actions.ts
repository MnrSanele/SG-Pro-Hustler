"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderProfileSchema } from "@/schemas/provider.schema";
import { calculateProfileStrength } from "@/services/credibility.service";
import type { ProviderProfileInput } from "@/schemas/provider.schema";

export async function updateProviderProfileAction(data: ProviderProfileInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = ProviderProfileSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) return { success: false, error: "Provider profile not found" };

    const updated = await prisma.providerProfile.update({
      where: { id: profile.id },
      data: {
        bio: validated.data.bio,
        tagline: validated.data.tagline,
        mainTrade: validated.data.mainTrade,
        pricingModel: validated.data.pricingModel,
        hourlyRate: validated.data.hourlyRate,
        dailyRate: validated.data.dailyRate,
        availableNow: validated.data.availableNow,
        emergencyAvailable: validated.data.emergencyAvailable,
        yearsExperience: validated.data.yearsExperience,
        serviceAreas: validated.data.serviceAreas,
        languages: validated.data.languages,
      },
    });

    const strength = await calculateProfileStrength(profile.id);
    await prisma.providerProfile.update({
      where: { id: profile.id },
      data: { profileStrength: strength },
    });

    return { success: true, profile: updated };
  } catch (error) {
    console.error("updateProviderProfileAction error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
