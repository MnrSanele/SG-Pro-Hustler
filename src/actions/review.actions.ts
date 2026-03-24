"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { ReviewSchema } from "@/schemas/review.schema";
import type { ReviewInput } from "@/schemas/review.schema";
import { createReview } from "@/services/review.service";

export async function createReviewAction(data: ReviewInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = ReviewSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const review = await createReview(session.user.id, session.user.role, validated.data);
    revalidatePath("/provider/jobs");
    revalidatePath("/requester/jobs");
    revalidatePath(`/requester/jobs/${validated.data.jobId}`);
    revalidatePath("/notifications");
    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error("createReviewAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create review" };
  }
}
