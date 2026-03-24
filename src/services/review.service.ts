import { prisma } from "@/lib/prisma";
import type { ReviewInput } from "@/schemas/review.schema";

export async function createReview(authorId: string, data: ReviewInput) {
  return prisma.review.create({
    data: {
      authorId,
      jobId: data.jobId,
      subjectUserId: data.subjectUserId,
      providerProfileId: data.providerProfileId,
      squadId: data.squadId,
      overallRating: data.overallRating,
      comment: data.comment,
      ...(data.scoreBreakdown && {
        scoreBreakdown: { create: data.scoreBreakdown },
      }),
    },
  });
}
