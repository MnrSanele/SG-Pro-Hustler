import { prisma } from "@/lib/prisma";
import type { ReviewInput } from "@/schemas/review.schema";
import { createNotification } from "@/services/notification.service";

async function recalculateProviderRating(
  providerProfileId: string,
  db: Pick<typeof prisma, "review" | "providerProfile"> = prisma,
) {
  const [aggregate, reviewCount] = await Promise.all([
    db.review.aggregate({
      where: {
        providerProfileId,
        type: "REQUESTER_TO_PROVIDER",
        isPublished: true,
      },
      _avg: {
        overallRating: true,
      },
    }),
    db.review.count({
      where: {
        providerProfileId,
        type: "REQUESTER_TO_PROVIDER",
        isPublished: true,
      },
    }),
  ]);

  await db.providerProfile.update({
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

  const revieweeId = data.type === "REQUESTER_TO_PROVIDER" ? job.assignedProviderId : job.requesterId;

  if (revieweeId === authorId) {
    throw new Error("You cannot review yourself");
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
        subjectUserId: revieweeId,
        providerProfileId: data.type === "REQUESTER_TO_PROVIDER" ? assignedProviderProfile.id : null,
        overallRating: data.overallRating,
        comment: data.comment,
        scoreBreakdown: {
          create: {
            quality: data.scoreBreakdown?.quality ?? data.overallRating,
            communication: data.scoreBreakdown?.communication ?? data.overallRating,
            punctuality: data.scoreBreakdown?.punctuality ?? data.overallRating,
            professionalism: data.scoreBreakdown?.professionalism ?? data.overallRating,
            valueForMoney: data.scoreBreakdown?.valueForMoney,
            wouldHireAgain: data.scoreBreakdown?.wouldHireAgain,
            clarityOfBrief: data.scoreBreakdown?.clarityOfBrief,
            paymentReliability: data.scoreBreakdown?.paymentReliability,
            conduct: data.scoreBreakdown?.conduct,
            worksiteReadiness: data.scoreBreakdown?.worksiteReadiness,
            wouldWorkAgain: data.scoreBreakdown?.wouldWorkAgain,
          },
        },
      },
    });

    if (data.type === "REQUESTER_TO_PROVIDER") {
      await recalculateProviderRating(assignedProviderProfile.id, tx);
    }

    await createNotification(
      revieweeId,
      "REVIEW_RECEIVED",
      "New review received",
      "You received a new review on a completed job.",
      { jobId: data.jobId, reviewId: createdReview.id, type: data.type },
      tx,
    );

    return createdReview;
  });

  return review;
}

export async function getReviewsDashboard(userId: string, role: string | undefined) {
  if (role === "REQUESTER") {
    return prisma.review.findMany({
      where: {
        subjectUserId: userId,
        type: "PROVIDER_TO_REQUESTER",
        isPublished: true,
      },
      include: {
        author: { select: { name: true, image: true } },
        job: { select: { id: true, title: true } },
        scoreBreakdown: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (role === "PROVIDER" || role === "SQUAD_LEADER") {
    const provider = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!provider) {
      return [];
    }

    return prisma.review.findMany({
      where: {
        providerProfileId: provider.id,
        type: "REQUESTER_TO_PROVIDER",
        isPublished: true,
      },
      include: {
        author: { select: { name: true, image: true } },
        job: { select: { id: true, title: true } },
        scoreBreakdown: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return [];
}
