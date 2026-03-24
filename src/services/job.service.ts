import { prisma } from "@/lib/prisma";
import type { SearchParams } from "@/types";

export async function getJobs(params: SearchParams = {}) {
  const { page = 1, limit = 12, q, category } = params;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: {
        status: "OPEN",
        ...(q && { title: { contains: q, mode: "insensitive" } }),
        ...(category && { category: { slug: category } }),
      },
      skip,
      take: limit,
      include: {
        requester: { select: { name: true, image: true } },
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.job.count({ where: { status: "OPEN" } }),
  ]);

  return { jobs, total, page, limit, hasMore: skip + limit < total };
}

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      requester: { select: { name: true, image: true } },
      category: true,
      attachments: true,
      applications: { include: { providerProfile: { include: { user: true } } } },
    },
  });
}
