"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  updateProviderModerationStatus,
  updateProviderVerificationStatus,
} from "@/services/admin.service";
import type { ModerationStatus, VerificationStatus } from "@prisma/client";

function ensureAdmin(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session.user.id;
}

export async function updateProviderModerationAction(
  providerId: string,
  status: ModerationStatus,
  notes?: string,
) {
  try {
    const session = await auth();
    const adminId = ensureAdmin(session);

    await updateProviderModerationStatus(providerId, status, adminId, notes);
    revalidatePath("/admin/providers");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update provider" };
  }
}

export async function updateProviderVerificationAction(
  providerId: string,
  status: VerificationStatus,
) {
  try {
    const session = await auth();
    const adminId = ensureAdmin(session);

    await updateProviderVerificationStatus(providerId, status, adminId);
    revalidatePath("/admin/providers");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to verify provider" };
  }
}
