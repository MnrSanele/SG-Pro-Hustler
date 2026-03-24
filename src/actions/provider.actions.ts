"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  PortfolioProjectSchema,
  ProviderProfileSchema,
  type PortfolioProjectInput,
  type ProviderProfileInput,
} from "@/schemas/provider.schema";
import {
  createPortfolioProjectForUser,
  updateProviderProfileForUser,
} from "@/services/provider.service";

export async function updateProviderProfileAction(data: ProviderProfileInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = ProviderProfileSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const profile = await updateProviderProfileForUser(session.user.id, validated.data);
    revalidatePath("/provider");
    revalidatePath(`/providers/${profile.slug}`);
    return { success: true, profile };
  } catch (error) {
    console.error("updateProviderProfileAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" };
  }
}

export async function createPortfolioProjectAction(data: PortfolioProjectInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = PortfolioProjectSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const project = await createPortfolioProjectForUser(session.user.id, validated.data);
    revalidatePath("/provider");
    revalidatePath("/provider/portfolio");
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("createPortfolioProjectAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create portfolio project",
    };
  }
}
