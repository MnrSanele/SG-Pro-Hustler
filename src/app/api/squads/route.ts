import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const skip = (page - 1) * limit;

    const [squads, total] = await Promise.all([
      prisma.squad.findMany({
        where: { moderationStatus: "APPROVED" },
        skip,
        take: limit,
        include: {
          categories: true,
          _count: { select: { members: true } },
        },
        orderBy: { averageRating: "desc" },
      }),
      prisma.squad.count({ where: { moderationStatus: "APPROVED" } }),
    ]);

    return NextResponse.json({ data: squads, total, page, limit, hasMore: skip + limit < total });
  } catch (error) {
    console.error("GET /api/squads error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
