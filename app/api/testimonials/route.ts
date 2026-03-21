import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const testimonials = await prisma?.testimonial.findMany({
      where: { approved: true },
      orderBy: { createdAt: "desc" },
    });
    if (!testimonials) throw new Error("DB unavailable");
    const data = testimonials.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      content: t.content,
      contentEn: t.contentEn,
      rating: t.rating,
      createdAt: t.createdAt.toISOString().split("T")[0],
    }));
    const res = NextResponse.json({ data, source: "db", timestamp: Date.now() });
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
    return res;
  } catch {
    const { getTestimonials } = await import("@/lib/data/testimonials");
    const res = NextResponse.json({ data: getTestimonials(), source: "fallback", timestamp: Date.now() });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, content, contentEn, rating } = body;
    if (!name || !content || !rating) {
      return NextResponse.json({ error: "name, content, and rating are required" }, { status: 400 });
    }
    const newT = await prisma?.testimonial.create({
      data: { name, role: role || "", content, contentEn: contentEn || "", rating, approved: false },
    });
    if (!newT) throw new Error("DB unavailable");
    return NextResponse.json({
      data: { id: newT.id, name: newT.name, role: newT.role, content: newT.content, contentEn: newT.contentEn, rating: newT.rating, createdAt: newT.createdAt.toISOString().split("T")[0] },
      source: "db",
      timestamp: Date.now(),
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
