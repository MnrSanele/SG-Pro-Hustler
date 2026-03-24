import { prisma } from "@/lib/prisma";
import type { JobApplicationInput } from "@/schemas/application.schema";
import type { JobInput } from "@/schemas/job.schema";
import type { SearchParams } from "@/types";

function assertRole(role: string | undefined, allowedRoles: string[], message: string) {
  if (!role || !allowedRoles.includes(role)) {
    throw new Error(message);
  }
}

async function getProviderProfileForUser(userId: string, tx: typeof prisma = prisma) {
  return tx.providerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
}

async function getCompletedJobCountsForUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, number>();
  }

  const grouped = await prisma.job.groupBy({
    by: ["assignedProviderId"],
    where: {
      status: "COMPLETED",
      assignedProviderId: { in: userIds },
    },
    _count: { _all: true },
  });

  return new Map(
    grouped
      .filter((entry) => entry.assignedProviderId)
      .map((entry) => [entry.assignedProviderId as string, entry._count._all]),
  );
}

export async function createJobForRequester(requesterId: string, role: string | undefined, data: JobInput) {
  assertRole(role, ["REQUESTER"], "Only requesters can create jobs");

  const requesterProfile = await prisma.requesterProfile.findUnique({
    where: { userId: requesterId },
    select: { id: true },
  });

  if (!requesterProfile) {
    throw new Error("Requester profile not found");
  }

  const job = await prisma.$transaction(async (tx) => {
    const createdJob = await tx.job.create({
      data: {
        requesterId,
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        mode: data.mode,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        urgency: data.urgency,
        preferredTiming: data.preferredTiming,
        location: data.location,
        materialsProvided: data.materialsProvided,
        requiredSkills: data.requiredSkills,
        isRemote: data.isRemote,
        status: "OPEN",
        publishedAt: new Date(),
      },
    });

    await tx.requesterProfile.update({
      where: { userId: requesterId },
      data: {
        jobsPosted: {
          increment: 1,
        },
      },
    });

    return createdJob;
  });

  return job;
}

export async function getJobs(params: SearchParams = {}) {
  const { page = 1, limit = 12, q, category, urgency, location } = params;
  const skip = (page - 1) * limit;

  const where = {
    status: "OPEN" as const,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category: { slug: category } }),
    ...(urgency && { urgency }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
  };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      include: {
        requester: { select: { name: true, image: true } },
        category: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, page, limit, hasMore: skip + limit < total };
}

export async function getPublicJobById(id: string, viewerUserId?: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      requester: { select: { id: true, name: true, image: true } },
      category: true,
      applications: viewerUserId
        ? {
            where: {
              providerProfile: {
                userId: viewerUserId,
              },
            },
            select: {
              id: true,
              status: true,
            },
          }
        : false,
    },
  });

  if (!job) {
    return null;
  }

  const hasApplied = Array.isArray(job.applications) && job.applications.length > 0;

  return {
    ...job,
    hasApplied,
  };
}

export async function submitJobApplication(userId: string, role: string | undefined, data: JobApplicationInput) {
  assertRole(role, ["PROVIDER", "SQUAD_LEADER"], "Only providers can apply to jobs");

  const providerProfile = await getProviderProfileForUser(userId);
  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const job = await prisma.job.findUnique({
    where: { id: data.jobId },
    select: {
      id: true,
      requesterId: true,
      mode: true,
      status: true,
      applications: {
        where: {
          providerProfileId: providerProfile.id,
        },
        select: { id: true },
      },
    },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "OPEN") {
    throw new Error("This job is no longer accepting applications");
  }

  if (job.requesterId === userId) {
    throw new Error("You cannot apply to your own job");
  }

  if (job.applications.length > 0) {
    throw new Error("You have already applied to this job");
  }

  const application = await prisma.jobApplication.create({
    data: {
      jobId: data.jobId,
      providerProfileId: providerProfile.id,
      coverLetter: data.message,
      proposedBudget: data.proposedBudget,
      status: "PENDING",
    },
  });

  return application;
}

export async function getRequesterJobsForUser(userId: string, role: string | undefined) {
  assertRole(role, ["REQUESTER"], "Only requesters can view these jobs");

  return prisma.job.findMany({
    where: { requesterId: userId },
    include: {
      category: true,
      _count: { select: { applications: true } },
      applications: {
        where: { status: "ACCEPTED" },
        include: {
          providerProfile: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRequesterJobDetail(userId: string, role: string | undefined, jobId: string) {
  assertRole(role, ["REQUESTER"], "Only requesters can view these jobs");

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      requesterId: userId,
    },
    include: {
      requester: { select: { id: true, name: true, email: true } },
      category: true,
      applications: {
        include: {
          providerProfile: {
            include: {
              user: {
                select: { id: true, name: true, image: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      reviews: {
        where: {
          authorId: userId,
          type: "REQUESTER_TO_PROVIDER",
        },
        select: { id: true },
      },
    },
  });

  if (!job) {
    return null;
  }

  const providerUserIds = job.applications
    .map((application) => application.providerProfile?.user.id)
    .filter((providerUserId): providerUserId is string => Boolean(providerUserId));

  const completedJobCounts = await getCompletedJobCountsForUsers(providerUserIds);

  return {
    ...job,
    applications: job.applications.map((application) => ({
      ...application,
      completedJobsCount: application.providerProfile?.user.id
        ? completedJobCounts.get(application.providerProfile.user.id) ?? 0
        : 0,
    })),
    hasRequesterReview: job.reviews.length > 0,
  };
}

export async function assignProviderToJob(
  requesterId: string,
  role: string | undefined,
  jobId: string,
  applicationId: string,
) {
  assertRole(role, ["REQUESTER"], "Only requesters can assign providers");

  return prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({
      where: {
        id: jobId,
        requesterId,
      },
      include: {
        applications: {
          where: { id: applicationId },
          include: {
            providerProfile: {
              include: {
                user: { select: { id: true } },
              },
            },
          },
        },
      },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "OPEN") {
      throw new Error("Only open jobs can be assigned");
    }

    const selectedApplication = job.applications[0];
    if (!selectedApplication?.providerProfile?.user.id) {
      throw new Error("Selected provider could not be found");
    }

    await tx.job.update({
      where: { id: jobId },
      data: {
        status: "ASSIGNED",
        assignedProviderId: selectedApplication.providerProfile.user.id,
      },
    });

    await tx.jobApplication.updateMany({
      where: {
        jobId,
        id: { not: applicationId },
      },
      data: {
        status: "REJECTED",
      },
    });

    await tx.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: "ACCEPTED",
      },
    });
  });
}

export async function rejectJobApplication(
  requesterId: string,
  role: string | undefined,
  jobId: string,
  applicationId: string,
) {
  assertRole(role, ["REQUESTER"], "Only requesters can reject applications");

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      requesterId,
    },
    select: { id: true, status: true },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.status !== "OPEN") {
    throw new Error("Applications can only be rejected while the job is open");
  }

  await prisma.jobApplication.update({
    where: { id: applicationId, jobId },
    data: {
      status: "REJECTED",
    },
  });
}

export async function getProviderJobsDashboard(userId: string, role: string | undefined) {
  assertRole(role, ["PROVIDER", "SQUAD_LEADER"], "Only providers can view these jobs");

  const providerProfile = await getProviderProfileForUser(userId);
  if (!providerProfile) {
    throw new Error("Provider profile not found");
  }

  const [applications, assignedJobs, providerReviews] = await Promise.all([
    prisma.jobApplication.findMany({
      where: {
        providerProfileId: providerProfile.id,
      },
      include: {
        job: {
          include: {
            requester: { select: { id: true, name: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: {
        assignedProviderId: userId,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"],
        },
      },
      include: {
        requester: { select: { id: true, name: true } },
        category: true,
        reviews: {
          where: {
            authorId: userId,
            type: "PROVIDER_TO_REQUESTER",
          },
          select: { id: true },
        },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
    prisma.review.findMany({
      where: {
        authorId: userId,
        type: "PROVIDER_TO_REQUESTER",
      },
      select: { jobId: true },
    }),
  ]);

  const reviewedJobIds = new Set(providerReviews.map((review) => review.jobId).filter(Boolean));

  return {
    applications,
    assignedJobs: assignedJobs.map((job) => ({
      ...job,
      hasProviderReview: job.reviews.length > 0 || reviewedJobIds.has(job.id),
    })),
  };
}

export async function startAssignedJob(userId: string, role: string | undefined, jobId: string) {
  assertRole(role, ["PROVIDER", "SQUAD_LEADER"], "Only the assigned provider can start this job");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, assignedProviderId: true, status: true },
  });

  if (!job || job.assignedProviderId !== userId) {
    throw new Error("You are not assigned to this job");
  }

  if (job.status !== "ASSIGNED") {
    throw new Error("Only assigned jobs can be started");
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "IN_PROGRESS" },
  });
}

export async function markJobReadyForCompletion(userId: string, role: string | undefined, jobId: string) {
  assertRole(role, ["PROVIDER", "SQUAD_LEADER"], "Only the assigned provider can update this job");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, assignedProviderId: true, status: true },
  });

  if (!job || job.assignedProviderId !== userId) {
    throw new Error("You are not assigned to this job");
  }

  if (job.status !== "IN_PROGRESS") {
    throw new Error("Only jobs in progress can be marked ready for completion");
  }

  await prisma.job.update({
    where: { id: jobId },
    data: { status: "IN_REVIEW" },
  });
}

export async function confirmJobCompletion(requesterId: string, role: string | undefined, jobId: string) {
  assertRole(role, ["REQUESTER"], "Only requesters can complete jobs");

  await prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({
      where: {
        id: jobId,
        requesterId,
      },
      select: { id: true, status: true },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "IN_REVIEW") {
      throw new Error("Only jobs awaiting requester review can be completed");
    }

    await tx.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    await tx.requesterProfile.update({
      where: { userId: requesterId },
      data: {
        jobsCompleted: {
          increment: 1,
        },
      },
    });
  });
}
