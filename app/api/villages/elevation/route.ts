import { NextRequest, NextResponse } from "next/server";
import { getElevationProfile } from "@/lib/data/villages";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to village IDs are required" },
      { status: 400 }
    );
  }

  const profile = getElevationProfile(from, to);
  if (profile.length === 0) {
    return NextResponse.json(
      { error: "Village not found" },
      { status: 404 }
    );
  }

  const maxElev = Math.max(...profile.map((p) => p.elevation));
  const minElev = Math.min(...profile.map((p) => p.elevation));
  const totalDist = profile[profile.length - 1]?.distance || 0;
  const elevGain = profile.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const diff = p.elevation - profile[i - 1].elevation;
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  return NextResponse.json({
    profile,
    stats: {
      maxElevation: maxElev,
      minElevation: minElev,
      totalDistance: totalDist,
      elevationGain: elevGain,
    },
  });
}
