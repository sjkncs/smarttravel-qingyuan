import { NextRequest, NextResponse } from "next/server";
import { retrieveDocuments, classifyIntent, knowledgeBase } from "@/lib/rag/knowledge-base";

// ═══════════════════════════════════════════════════════
// AI Recommend API — RAG驱动的智能村落推荐 + LLM增强
// 输入用户偏好 → RAG检索 → 评分排序 → LLM生成推荐理由
// ═══════════════════════════════════════════════════════

interface RecommendRequest {
  preferences: {
    groupType?: "family" | "couple" | "solo" | "friends" | "elderly";
    days?: number;
    budget?: "low" | "medium" | "high";
    interests?: string[];
    season?: "spring" | "summer" | "autumn" | "winter";
  };
  locale?: "zh" | "en";
}

interface VillageScore {
  name: string;
  nameEn: string;
  score: number;
  reasons: string[];
  rai: number;
  cpi: number;
  vsi: number;
  highlights: string[];
}

const VILLAGE_DATA = [
  {
    name: "峰林小镇", nameEn: "Fenglin Town",
    rai: 92, cpi: 85, vsi: 95,
    tags: ["温泉", "峰林", "田园", "徒步", "亲子", "老人友好", "摄影"],
    budget: "medium" as const,
    seasons: ["spring", "autumn", "winter"],
    groups: ["family", "couple", "elderly"],
  },
  {
    name: "南岗千年瑶寨", nameEn: "Nangang Yao Village",
    rai: 78, cpi: 98, vsi: 88,
    tags: ["瑶族", "非遗", "文化", "长鼓舞", "民族服饰", "摄影"],
    budget: "medium" as const,
    seasons: ["spring", "autumn"],
    groups: ["couple", "friends", "solo"],
  },
  {
    name: "上岳古村", nameEn: "Shangyue Ancient Village",
    rai: 95, cpi: 88, vsi: 93,
    tags: ["古建筑", "锅耳墙", "广府文化", "宗祠", "摄影", "亲子", "免费"],
    budget: "low" as const,
    seasons: ["spring", "autumn", "winter"],
    groups: ["family", "couple", "solo", "friends"],
  },
  {
    name: "油岭瑶寨", nameEn: "Youling Yao Village",
    rai: 65, cpi: 96, vsi: 82,
    tags: ["耍歌堂", "瑶族", "刺绣", "原生态", "徒步", "冒险"],
    budget: "low" as const,
    seasons: ["autumn"],
    groups: ["friends", "solo"],
  },
  {
    name: "积庆里", nameEn: "Jiqingli",
    rai: 88, cpi: 82, vsi: 91,
    tags: ["红茶", "茶园", "客家文化", "品茗", "疗愈", "安静"],
    budget: "medium" as const,
    seasons: ["spring", "summer"],
    groups: ["couple", "solo", "elderly"],
  },
];

export async function POST(req: NextRequest) {
  try {
    const body: RecommendRequest = await req.json();
    const { preferences, locale = "zh" } = body;

    // ── Step 1: 基于偏好的多维评分 ─────────────────────
    const scored: VillageScore[] = VILLAGE_DATA.map((v) => {
      let score = 50; // 基础分
      const reasons: string[] = [];

      // 人群匹配
      if (preferences.groupType && v.groups.includes(preferences.groupType)) {
        score += 15;
        reasons.push(locale === "zh" ? `适合${groupLabel(preferences.groupType)}出游` : `Suitable for ${preferences.groupType} trips`);
      }

      // 预算匹配
      if (preferences.budget) {
        if (v.budget === preferences.budget) { score += 10; }
        else if (preferences.budget === "low" && v.budget === "low") { score += 15; reasons.push(locale === "zh" ? "高性价比" : "High value"); }
      }

      // 兴趣匹配
      if (preferences.interests) {
        const matchCount = preferences.interests.filter((i) => v.tags.some((t) => t.includes(i) || i.includes(t))).length;
        score += matchCount * 8;
        if (matchCount > 0) reasons.push(locale === "zh" ? `匹配${matchCount}项兴趣` : `Matches ${matchCount} interests`);
      }

      // 季节匹配
      if (preferences.season && v.seasons.includes(preferences.season)) {
        score += 10;
        reasons.push(locale === "zh" ? `${seasonLabel(preferences.season)}最佳` : `Best in ${preferences.season}`);
      }

      // RAI/VSI加权 — 安全和可达性对家庭/老人更重要
      if (preferences.groupType === "family" || preferences.groupType === "elderly") {
        score += (v.rai / 10) + (v.vsi / 10);
        if (v.rai >= 90) reasons.push(locale === "zh" ? "交通便利(RAI≥90)" : "Easy access (RAI≥90)");
        if (v.vsi >= 90) reasons.push(locale === "zh" ? "安全指数高(VSI≥90)" : "High safety (VSI≥90)");
      }

      // CPI加权 — 文化兴趣加分
      if (preferences.interests?.some((i) => ["文化", "非遗", "瑶族", "culture"].includes(i))) {
        score += v.cpi / 10;
        if (v.cpi >= 95) reasons.push(locale === "zh" ? "文化保护顶级(CPI≥95)" : "Top cultural preservation");
      }

      return {
        name: v.name,
        nameEn: v.nameEn,
        score: Math.min(100, Math.round(score)),
        reasons: reasons.slice(0, 4),
        rai: v.rai,
        cpi: v.cpi,
        vsi: v.vsi,
        highlights: v.tags.slice(0, 5),
      };
    });

    scored.sort((a, b) => b.score - a.score);

    // ── Step 2: RAG检索补充信息 ─────────────────────────
    const queryParts = [
      preferences.groupType ? groupLabel(preferences.groupType) : "",
      preferences.interests?.join(" ") || "",
      preferences.season ? seasonLabel(preferences.season) : "",
      "推荐",
    ].filter(Boolean);
    const ragDocs = retrieveDocuments(queryParts.join(" "), 3);

    // ── Step 3: LLM生成个性化推荐理由（可选）──────────
    let aiSummary = "";
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey) {
      try {
        const topVillages = scored.slice(0, 3).map((v) => `${v.name}(评分${v.score})`).join("、");
        const ragSnippet = ragDocs.map((d) => d.title).join("、");
        const prompt = `用户偏好：${JSON.stringify(preferences)}。推荐村落：${topVillages}。参考知识：${ragSnippet}。请用2-3句话总结推荐理由，不超过100字。`;

        const llmRes = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: "你是清远旅游推荐助手，简洁专业地回答。" },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (llmRes.ok) {
          const data = await llmRes.json();
          aiSummary = data.choices?.[0]?.message?.content || "";
        }
      } catch {
        // LLM unavailable, skip AI summary
      }
    }

    return NextResponse.json({
      recommendations: scored,
      aiSummary: aiSummary || (locale === "zh"
        ? `基于您的偏好，我们推荐${scored[0].name}作为首选目的地，综合评分${scored[0].score}/100。`
        : `Based on your preferences, we recommend ${scored[0].nameEn} as top choice with score ${scored[0].score}/100.`),
      ragContext: ragDocs.map((d) => ({ title: d.title, category: d.category })),
      source: apiKey ? "ai" : "algorithm",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[AI Recommend Error]", error);
    return NextResponse.json({ error: "Recommendation failed" }, { status: 500 });
  }
}

function groupLabel(g: string): string {
  const map: Record<string, string> = { family: "家庭", couple: "情侣", solo: "独行", friends: "朋友", elderly: "长辈" };
  return map[g] || g;
}

function seasonLabel(s: string): string {
  const map: Record<string, string> = { spring: "春季", summer: "夏季", autumn: "秋季", winter: "冬季" };
  return map[s] || s;
}
