import { prisma } from "@/lib/prisma";
import type { JobInput } from "@/schemas/job.schema";

export async function createJob(requesterId: string, data: JobInput) {
  return prisma.job.create({
    data: {
      requesterId,
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      mode: data.mode,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      urgency: data.urgency,
      location: data.location,
      materialsProvided: data.materialsProvided,
      requiredSkills: data.requiredSkills,
      isRemote: data.isRemote,
      status: "DRAFT",
    },
  });
}

export async function publishJob(id: string, requesterId: string) {
  return prisma.job.update({
    where: { id, requesterId },
    data: { status: "OPEN", publishedAt: new Date() },
  });
}
