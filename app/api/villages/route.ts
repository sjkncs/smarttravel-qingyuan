import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const rankBy = searchParams.get("rankBy") as "rating" | "visitors" | "cpi" | "rai" | "vsi" | null;

    let villages;

    if (search) {
      villages = await prisma?.village.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { nameEn: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { tags: { has: search } },
          ],
        },
        include: { detail: true },
      });
    } else if (rankBy) {
      const orderMap: Record<string, object> = {
        rating: { rating: "desc" },
        visitors: { visitors: "desc" },
        cpi: { cpiScore: "desc" },
        rai: { raiScore: "desc" },
        vsi: { vsiScore: "desc" },
      };
      villages = await prisma?.village.findMany({
        where: { published: true },
        orderBy: orderMap[rankBy] || { rating: "desc" },
        include: { detail: true },
      });
    } else if (category && category !== "all") {
      villages = await prisma?.village.findMany({
        where: { published: true, category },
        include: { detail: true },
      });
    } else {
      villages = await prisma?.village.findMany({
        where: { published: true },
        include: { detail: true },
      });
    }

    // Transform to match frontend interface
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

    const res = NextResponse.json({ data, source: "db", timestamp: Date.now() });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
    return res;
  } catch (error) {
    console.error("[Villages API Error]", error);
    // Fallback to in-memory data if DB is not available
    const { getVillages, getVillagesByCategory, searchVillages, getVillageRankings } = await import("@/lib/data/villages");
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const rankBy = searchParams.get("rankBy") as "rating" | "visitors" | "cpi" | "rai" | "vsi" | null;

    const fallbackRes = (d: unknown) => {
      const r = NextResponse.json({ data: d, source: "fallback", timestamp: Date.now() });
      r.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
      return r;
    };
    if (search) return fallbackRes(searchVillages(search));
    if (rankBy) return fallbackRes(getVillageRankings(rankBy));
    if (category && category !== "all") return fallbackRes(getVillagesByCategory(category));
    return fallbackRes(getVillages());
  }
}
