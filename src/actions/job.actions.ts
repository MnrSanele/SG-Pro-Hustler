"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { JobApplicationSchema } from "@/schemas/application.schema";
import type { JobApplicationInput } from "@/schemas/application.schema";
import { JobSchema } from "@/schemas/job.schema";
import type { JobInput } from "@/schemas/job.schema";
import {
  assignProviderToJob,
  confirmJobCompletion,
  createJobForRequester,
  markJobReadyForCompletion,
  rejectJobApplication,
  startAssignedJob,
  submitJobApplication,
} from "@/services/job.service";

export async function createJobAction(data: JobInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = JobSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const job = await createJobForRequester(session.user.id, session.user.role, validated.data);
    revalidatePath("/jobs");
    revalidatePath("/requester/jobs");
    return { success: true, jobId: job.id, redirectTo: `/requester/jobs/${job.id}` };
  } catch (error) {
    console.error("createJobAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create job" };
  }
}

export async function submitJobApplicationAction(data: JobApplicationInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = JobApplicationSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    await submitJobApplication(session.user.id, session.user.role, validated.data);
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${validated.data.jobId}`);
    revalidatePath("/provider/jobs");
    revalidatePath(`/requester/jobs/${validated.data.jobId}`);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("submitJobApplicationAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to apply for job" };
  }
}

export async function assignProviderAction(jobId: string, applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await assignProviderToJob(session.user.id, session.user.role, jobId, applicationId);
    revalidatePath("/requester/jobs");
    revalidatePath(`/requester/jobs/${jobId}`);
    revalidatePath("/provider/jobs");
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("assignProviderAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to assign provider" };
  }
}

export async function rejectApplicationAction(jobId: string, applicationId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await rejectJobApplication(session.user.id, session.user.role, jobId, applicationId);
    revalidatePath(`/requester/jobs/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("rejectApplicationAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to reject application" };
  }
}

export async function startJobAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await startAssignedJob(session.user.id, session.user.role, jobId);
    revalidatePath("/provider/jobs");
    revalidatePath(`/requester/jobs/${jobId}`);
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("startJobAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to start job" };
  }
}

export async function markJobReadyForCompletionAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await markJobReadyForCompletion(session.user.id, session.user.role, jobId);
    revalidatePath("/provider/jobs");
    revalidatePath(`/requester/jobs/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("markJobReadyForCompletionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update job status",
    };
  }
}

export async function confirmJobCompletionAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await confirmJobCompletion(session.user.id, session.user.role, jobId);
    revalidatePath("/requester/jobs");
    revalidatePath(`/requester/jobs/${jobId}`);
    revalidatePath("/provider/jobs");
    revalidatePath("/notifications");
    return { success: true };
  } catch (error) {
    console.error("confirmJobCompletionAction error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete job",
    };
  }
}
