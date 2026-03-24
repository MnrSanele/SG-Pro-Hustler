import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const skip = (page - 1) * limit;

    const where = {
      moderationStatus: "APPROVED" as const,
      ...(q && {
        user: {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        },
      }),
    };

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, image: true } },
          skills: { include: { skill: { include: { category: true } } } },
        },
        orderBy: { averageRating: "desc" },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    // Filter by category if provided
    const filtered = category
      ? providers.filter((p) =>
          p.skills.some((s) => s.skill.category.slug === category)
        )
      : providers;

    return NextResponse.json({
      data: filtered,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error("GET /api/providers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
