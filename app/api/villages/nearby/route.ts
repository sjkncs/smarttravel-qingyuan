import { NextRequest, NextResponse } from "next/server";
import { getNearbyVillages } from "@/lib/data/villages";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");
  const maxDist = parseFloat(searchParams.get("maxDist") || "200");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const nearby = getNearbyVillages(lat, lng, maxDist);
  const data = nearby.map((v) => ({
    id: v.id,
    name: v.name,
    nameEn: v.nameEn,
    location: v.location,
    latitude: v.latitude,
    longitude: v.longitude,
    elevation: v.elevation,
    terrain: v.terrain,
    rating: v.rating,
    category: v.category,
    distance: Math.round(v.distance * 10) / 10,
    vsi: v.highlights.vsi,
    image: v.image,
  }));

  return NextResponse.json({ villages: data, count: data.length });
}
