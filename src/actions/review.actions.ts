"use server";

import { auth } from "@/lib/auth";
import { createReview } from "@/services/review.service";
import { ReviewSchema } from "@/schemas/review.schema";
import type { ReviewInput } from "@/schemas/review.schema";

export async function createReviewAction(data: ReviewInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = ReviewSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const review = await createReview(session.user.id, validated.data);
    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error("createReviewAction error:", error);
    return { success: false, error: "Failed to create review" };
  }
}
