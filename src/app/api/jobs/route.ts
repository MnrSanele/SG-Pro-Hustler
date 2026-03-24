import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { status: "OPEN" },
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

    return NextResponse.json({ data: jobs, total, page, limit, hasMore: skip + limit < total });
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
