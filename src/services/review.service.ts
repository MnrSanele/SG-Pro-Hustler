import { prisma } from "@/lib/prisma";
import type { ReviewInput } from "@/schemas/review.schema";

async function recalculateProviderRating(providerProfileId: string, tx: typeof prisma = prisma) {
  const [aggregate, reviewCount] = await Promise.all([
    tx.review.aggregate({
      where: {
        providerProfileId,
        type: "REQUESTER_TO_PROVIDER",
        isPublished: true,
      },
      _avg: {
        overallRating: true,
      },
    }),
    tx.review.count({
      where: {
        providerProfileId,
        type: "REQUESTER_TO_PROVIDER",
        isPublished: true,
      },
    }),
  ]);

  await tx.providerProfile.update({
    where: { id: providerProfileId },
    data: {
      averageRating: aggregate._avg.overallRating ?? 0,
      reviewCount,
    },
  });
}

export async function createReview(authorId: string, role: string | undefined, data: ReviewInput) {
  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    include: {
      applications: {
        where: { status: "ACCEPTED" },
        include: {
          providerProfile: {
            select: {
              id: true,
              userId: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "COMPLETED") {
    throw new Error("Reviews are only available after a job is completed");
  }

  const acceptedApplication = job.applications[0];
  const assignedProviderProfile = acceptedApplication?.providerProfile;

  if (!assignedProviderProfile || !job.assignedProviderId) {
    throw new Error("Assigned provider could not be determined");
  }

  if (data.type === "REQUESTER_TO_PROVIDER") {
    if (role !== "REQUESTER" || job.requesterId !== authorId) {
      throw new Error("Only the requester can leave a provider review");
    }
  }

  if (data.type === "PROVIDER_TO_REQUESTER") {
    if (!["PROVIDER", "SQUAD_LEADER"].includes(role ?? "") || job.assignedProviderId !== authorId) {
      throw new Error("Only the assigned provider can review the requester");
    }
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      jobId: data.jobId,
      authorId,
      type: data.type,
    },
    select: { id: true },
  });

  if (existingReview) {
    throw new Error("You have already submitted this review");
  }

  const review = await prisma.$transaction(async (tx) => {
    const createdReview = await tx.review.create({
      data: {
        jobId: data.jobId,
        authorId,
        type: data.type,
        subjectUserId: data.type === "REQUESTER_TO_PROVIDER" ? job.assignedProviderId : job.requesterId,
        providerProfileId: data.type === "REQUESTER_TO_PROVIDER" ? assignedProviderProfile.id : null,
        overallRating: data.overallRating,
        comment: data.comment,
        ...(data.scoreBreakdown
          ? {
              scoreBreakdown: {
                create: data.scoreBreakdown,
              },
            }
          : {}),
      },
    });

    if (data.type === "REQUESTER_TO_PROVIDER") {
      await recalculateProviderRating(assignedProviderProfile.id, tx);
    }

    return createdReview;
  });

  return review;
}
