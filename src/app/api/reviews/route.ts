import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerProfileId = searchParams.get("providerProfileId");
    const squadId = searchParams.get("squadId");

    if (!providerProfileId && !squadId) {
      return NextResponse.json({ error: "providerProfileId or squadId required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        isPublished: true,
        ...(providerProfileId && { providerProfileId }),
        ...(squadId && { squadId }),
      },
      include: {
        author: { select: { name: true, image: true } },
        scoreBreakdown: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: reviews });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
