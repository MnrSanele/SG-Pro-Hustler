import { prisma } from "@/lib/prisma";

export async function getRequesterJobs(userId: string) {
  return prisma.job.findMany({
    where: { requesterId: userId },
    include: { category: true, _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}
