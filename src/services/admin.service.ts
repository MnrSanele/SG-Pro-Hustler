import { prisma } from "@/lib/prisma";
import { createNotification } from "@/services/notification.service";
import type { ModerationStatus, VerificationStatus } from "@prisma/client";

export async function getProvidersForAdmin() {
  return prisma.providerProfile.findMany({
    include: {
      user: true,
      skills: { include: { skill: true } },
      _count: { select: { reviews: true, portfolio: true } },
    },
    orderBy: [{ moderationStatus: "asc" }, { createdAt: "desc" }],
  });
}

export async function updateProviderModerationStatus(
  id: string,
  status: ModerationStatus,
  adminId: string,
  notes?: string,
) {
  return prisma.$transaction(async (tx) => {
    const provider = await tx.providerProfile.update({
      where: { id },
      data: {
        moderationStatus: status,
        ...(notes ? { user: { update: { moderationNotes: notes } } } : {}),
      },
      include: {
        user: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: `MODERATION_${status}`,
        entityType: "ProviderProfile",
        entityId: id,
        newValue: { status, notes },
      },
    });

    await createNotification(
      provider.userId,
      "ADMIN_ACTION",
      "Profile moderation updated",
      `Your provider profile is now ${status.toLowerCase()}.`,
      { status, notes },
      tx,
    );

    return provider;
  });
}

export async function updateProviderVerificationStatus(
  id: string,
  verificationStatus: VerificationStatus,
  adminId: string,
) {
  return prisma.$transaction(async (tx) => {
    const provider = await tx.providerProfile.update({
      where: { id },
      data: {
        idVerificationStatus: verificationStatus,
        user: {
          update: {
            phoneVerified: verificationStatus === "VERIFIED",
          },
        },
      },
      include: {
        user: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: `VERIFICATION_${verificationStatus}`,
        entityType: "ProviderProfile",
        entityId: id,
        newValue: { verificationStatus },
      },
    });

    await createNotification(
      provider.userId,
      "VERIFICATION_UPDATE",
      "Verification status updated",
      `Your verification status is now ${verificationStatus.toLowerCase()}.`,
      { verificationStatus },
      tx,
    );

    return provider;
  });
}

export async function getAllJobsForAdmin() {
  return prisma.job.findMany({
    include: {
      requester: { select: { name: true, email: true } },
      category: true,
      _count: { select: { applications: true, reviews: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getFlaggedReviews() {
  return prisma.review.findMany({
    where: { isFlagged: true },
    include: {
      author: { select: { name: true, email: true } },
      subjectUser: { select: { name: true, email: true } },
      job: { select: { id: true, title: true } },
      providerProfile: { select: { slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminStats() {
  const [totalUsers, totalProviders, totalJobs, pendingProviders, flaggedReviews] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.job.count(),
    prisma.providerProfile.count({ where: { moderationStatus: "PENDING" } }),
    prisma.review.count({ where: { isFlagged: true } }),
  ]);

  return { totalUsers, totalProviders, totalJobs, pendingProviders, flaggedReviews };
}
