import { prisma } from "@/lib/prisma";
import type { ModerationStatus } from "@prisma/client";

export async function getPendingProviders() {
  return prisma.providerProfile.findMany({
    where: { moderationStatus: "PENDING" },
    include: { user: true },
  });
}

export async function updateProviderModerationStatus(
  id: string,
  status: ModerationStatus,
  adminId: string,
  notes?: string
) {
  const [provider] = await Promise.all([
    prisma.providerProfile.update({
      where: { id },
      data: { moderationStatus: status, ...(notes && { user: { update: { moderationNotes: notes } } }) },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: `MODERATION_${status}`,
        entityType: "ProviderProfile",
        entityId: id,
        newValue: { status, notes },
      },
    }),
  ]);
  return provider;
}

export async function getAdminStats() {
  const [totalUsers, totalProviders, totalJobs, pendingProviders] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.job.count(),
    prisma.providerProfile.count({ where: { moderationStatus: "PENDING" } }),
  ]);

  return { totalUsers, totalProviders, totalJobs, pendingProviders };
}
