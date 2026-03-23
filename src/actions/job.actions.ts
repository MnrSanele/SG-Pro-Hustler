"use server";

import { auth } from "@/lib/auth";
import { createJob, publishJob } from "@/repositories/job.repository";
import { JobSchema } from "@/schemas/job.schema";
import type { JobInput } from "@/schemas/job.schema";

export async function createJobAction(data: JobInput) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  const validated = JobSchema.safeParse(data);
  if (!validated.success) return { success: false, error: validated.error.issues[0].message };

  try {
    const job = await createJob(session.user.id, validated.data);
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("createJobAction error:", error);
    return { success: false, error: "Failed to create job" };
  }
}

export async function publishJobAction(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const job = await publishJob(jobId, session.user.id);
    return { success: true, job };
  } catch (error) {
    console.error("publishJobAction error:", error);
    return { success: false, error: "Failed to publish job" };
  }
}
