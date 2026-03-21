import { NextRequest, NextResponse } from "next/server";
import { moderateContentWithAI, moderateBatchWithAI } from "@/lib/content-moderation";

// POST /api/ai/moderation — 内容审核
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 单条审核
    if (action === "check" || !action) {
      const { title, content } = body;
      if (!content) {
        return NextResponse.json({ error: "content is required" }, { status: 400 });
      }
      const result = await moderateContentWithAI(content, { title });
      return NextResponse.json({ result, timestamp: Date.now() });
    }

    // 批量审核（管理后台用）
    if (action === "batch") {
      const { items } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "items array is required" }, { status: 400 });
      }
      if (items.length > 100) {
        return NextResponse.json({ error: "batch limit is 100 items" }, { status: 400 });
      }
      const results = await moderateBatchWithAI(items);
      const stats = {
        total: results.length,
        safe: results.filter((r) => r.result.level === "safe").length,
        review: results.filter((r) => r.result.level === "review").length,
        rejected: results.filter((r) => r.result.level === "reject").length,
      };
      return NextResponse.json({ results, stats, timestamp: Date.now() });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[Moderation API Error]", error);
    return NextResponse.json({ error: "moderation service error" }, { status: 500 });
  }
}
