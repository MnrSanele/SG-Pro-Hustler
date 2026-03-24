"use server";

import { auth } from "@/lib/auth";
import { createSquad, findSquadBySlug } from "@/repositories/squad.repository";
import { SquadSchema } from "@/schemas/squad.schema";
import { prisma } from "@/lib/prisma";
import type { SquadInput } from "@/schemas/squad.schema";

export async function createSquadAction(data: SquadInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = SquadSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const existing = await findSquadBySlug(validated.data.slug);
    if (existing) return { success: false, error: "A squad with this name already exists" };

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: session.user.id },
    });

    const squad = await createSquad({
      name: validated.data.name,
      slug: validated.data.slug,
      description: validated.data.description,
      leaderId: session.user.id,
      leaderProviderProfileId: providerProfile?.id,
    });

    return { success: true, squadId: squad.id };
  } catch (error) {
    console.error("createSquadAction error:", error);
    return { success: false, error: "Failed to create squad" };
  }
}
