import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { retrieveDocuments } from "@/lib/rag/knowledge-base";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const withAI = _req.nextUrl.searchParams.get("ai") === "1";

  try {
    const v = await prisma?.village.findUnique({
      where: { slug: id },
      include: { detail: true },
    });

    if (!v) {
      const { getVillageById } = await import("@/lib/data/villages");
      const village = getVillageById(id);
      if (!village) return NextResponse.json({ error: "Village not found" }, { status: 404 });
      const aiInsight = withAI ? await generateAIInsight(village.name) : undefined;
      return NextResponse.json({ data: village, aiInsight, source: "fallback", timestamp: Date.now() });
    }

    const data = {
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
    };

    const aiInsight = withAI ? await generateAIInsight(v.name) : undefined;
    return NextResponse.json({ data, aiInsight, source: "db", timestamp: Date.now() });
  } catch {
    const { getVillageById } = await import("@/lib/data/villages");
    const village = getVillageById(id);
    if (!village) return NextResponse.json({ error: "Village not found" }, { status: 404 });
    const aiInsight = withAI ? await generateAIInsight(village.name) : undefined;
    return NextResponse.json({ data: village, aiInsight, source: "fallback", timestamp: Date.now() });
  }
}

async function generateAIInsight(villageName: string): Promise<string | undefined> {
  const docs = retrieveDocuments(villageName, 3);
  if (docs.length === 0) return undefined;

  const ragContext = docs.map((d) => `【${d.title}】${d.content.substring(0, 300)}`).join("\n");
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    // Local RAG-only insight
    const doc = docs[0];
    return `**AI洞察**：${doc.content.substring(0, 150)}...`;
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: `你是清远旅游数据分析师。基于知识库为「${villageName}」生成3条核心洞察（每条不超过30字），用JSON数组格式返回。\n\n${ragContext}` },
          { role: "user", content: `分析${villageName}的核心优势和注意事项` },
        ],
        temperature: 0.5,
        max_tokens: 300,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content || undefined;
    }
  } catch { /* fallback */ }

  return `**AI洞察**：${docs[0].content.substring(0, 150)}...`;
}
