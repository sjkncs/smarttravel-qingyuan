import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stats = await prisma?.platformStat.findMany();
    if (!stats) throw new Error("DB unavailable");
    const data = stats.map((s) => ({
      id: s.key,
      value: s.value,
      suffix: s.suffix,
      label: s.label,
      labelEn: s.labelEn,
    }));
    const res = NextResponse.json({ data, source: "db", timestamp: Date.now() });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
    return res;
  } catch {
    const { getStats } = await import("@/lib/data/stats");
    const res = NextResponse.json({ data: getStats(), source: "fallback", timestamp: Date.now() });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, value } = body;
    if (!id || value === undefined) {
      return NextResponse.json({ error: "id and value are required" }, { status: 400 });
    }
    const updated = await prisma?.platformStat.update({
      where: { key: id },
      data: { value },
    });
    if (!updated) throw new Error("DB unavailable");
    return NextResponse.json({
      data: { id: updated.key, value: updated.value, suffix: updated.suffix, label: updated.label, labelEn: updated.labelEn },
      source: "db",
      timestamp: Date.now(),
    });
  } catch {
    return NextResponse.json({ error: "Stat not found" }, { status: 404 });
  }
}
