import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sortBy = (searchParams.get("sortBy") as "rating" | "visitors" | "cpi" | "rai" | "vsi") || "rating";

  try {
    const orderMap: Record<string, object> = {
      rating: { rating: "desc" },
      visitors: { visitors: "desc" },
      cpi: { cpiScore: "desc" },
      rai: { raiScore: "desc" },
      vsi: { vsiScore: "desc" },
    };

    const villages = await prisma?.village.findMany({
      where: { published: true },
      orderBy: orderMap[sortBy] || { rating: "desc" },
      include: { detail: true },
    });

    if (!villages) throw new Error("DB unavailable");
    const data = villages.map((v) => ({
      id: v.slug,
      name: v.name,
      nameEn: v.nameEn,
      location: v.location,
      image: v.image,
      rating: v.rating,
      tags: v.tags,
      tagsEn: v.tagsEn,
      description: v.description,
      descEn: v.descEn,
      highlights: { rai: v.raiScore, cpi: v.cpiScore, vsi: v.vsiScore },
      season: v.season,
      seasonEn: v.seasonEn,
      category: v.category,
      visitors: v.visitors,
      reviewCount: v.reviewCount,
      details: v.detail ? {
        activities: v.detail.activities,
        bestTime: v.detail.bestTime,
        transport: v.detail.transport,
        tips: v.detail.tips,
      } : undefined,
    }));

    return NextResponse.json({ data, sortBy, source: "db", timestamp: Date.now() });
  } catch {
    const { getVillageRankings } = await import("@/lib/data/villages");
    const rankings = getVillageRankings(sortBy);
    return NextResponse.json({ data: rankings, sortBy, source: "fallback", timestamp: Date.now() });
  }
}
