import { NextRequest, NextResponse } from "next/server";
import { retrieveDocuments, classifyIntent } from "@/lib/rag/knowledge-base";

// ═══════════════════════════════════════════════════════
// AI Insights API — RAG驱动的智能分析与决策支持
// 为村落详情页、排行榜、决策面板提供AI洞察
// ═══════════════════════════════════════════════════════

interface InsightRequest {
  type: "village_analysis" | "comparison" | "trend" | "decision";
  target?: string;        // 村落名称
  targets?: string[];     // 对比多个村落
  context?: string;       // 额外上下文
  locale?: "zh" | "en";
}

export async function POST(req: NextRequest) {
  try {
    const body: InsightRequest = await req.json();
    const { type, target, targets, context, locale = "zh" } = body;

    // ── RAG检索相关知识 ─────────────────────────────────
    const query = [target, ...(targets || []), context, type].filter(Boolean).join(" ");
    const ragDocs = retrieveDocuments(query, 4);
    const ragContext = ragDocs.map((d) => `【${d.title}】${d.content.substring(0, 200)}`).join("\n");

    // ── 根据类型生成本地洞察 ────────────────────────────
    let localInsight = "";
    switch (type) {
      case "village_analysis":
        localInsight = generateVillageAnalysis(target || "", ragDocs, locale);
        break;
      case "comparison":
        localInsight = generateComparison(targets || [], ragDocs, locale);
        break;
      case "trend":
        localInsight = generateTrendInsight(target || "", ragDocs, locale);
        break;
      case "decision":
        localInsight = generateDecisionSupport(context || "", ragDocs, locale);
        break;
    }

    // ── LLM增强（如果API可用）──────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (apiKey) {
      try {
        const systemPrompt = `你是清远旅游数据分析师。基于以下RAG知识库信息，提供专业的${typeLabel(type)}分析。
用Markdown格式回答，包含数据指标(RAI/CPI/VSI)和具体建议。简洁有力，不超过300字。

知识库参考：
${ragContext}`;

        const userPrompt = type === "comparison"
          ? `对比分析：${(targets || []).join(" vs ")}。${context || ""}`
          : type === "village_analysis"
            ? `深度分析村落：${target}。涵盖可达性、文化保护、安全指数、最佳季节、目标人群。${context || ""}`
            : type === "decision"
              ? `决策支持：${context}`
              : `趋势分析：${target}。${context || ""}`;

        const llmRes = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.6,
            max_tokens: 800,
          }),
        });

        if (llmRes.ok) {
          const data = await llmRes.json();
          const aiContent = data.choices?.[0]?.message?.content;
          if (aiContent) {
            return NextResponse.json({
              insight: aiContent,
              localInsight,
              type,
              ragDocsUsed: ragDocs.length,
              source: "llm",
              timestamp: Date.now(),
            });
          }
        }
      } catch {
        // LLM failed, use local insight
      }
    }

    // ── 降级：返回本地洞察 ──────────────────────────────
    return NextResponse.json({
      insight: localInsight,
      type,
      ragDocsUsed: ragDocs.length,
      source: "local",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[AI Insights Error]", error);
    return NextResponse.json({ error: "Insight generation failed" }, { status: 500 });
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    village_analysis: "村落深度",
    comparison: "对比",
    trend: "趋势",
    decision: "决策支持",
  };
  return map[type] || type;
}

// ── 本地洞察生成器 ─────────────────────────────────────

const VILLAGE_METRICS: Record<string, { rai: number; cpi: number; vsi: number; visitors: number; bestFor: string[] }> = {
  "峰林小镇": { rai: 92, cpi: 85, vsi: 95, visitors: 45000, bestFor: ["家庭", "温泉", "摄影"] },
  "南岗千年瑶寨": { rai: 78, cpi: 98, vsi: 88, visitors: 32000, bestFor: ["文化体验", "摄影", "民族风情"] },
  "上岳古村": { rai: 95, cpi: 88, vsi: 93, visitors: 28000, bestFor: ["古建筑", "家庭", "预算游"] },
  "油岭瑶寨": { rai: 65, cpi: 96, vsi: 82, visitors: 12000, bestFor: ["探险", "原生态", "非遗"] },
  "积庆里": { rai: 88, cpi: 82, vsi: 91, visitors: 25000, bestFor: ["茶文化", "疗愈", "情侣"] },
};

function generateVillageAnalysis(
  name: string,
  docs: { title: string; content: string }[],
  locale: string
): string {
  const metrics = VILLAGE_METRICS[name];
  if (!metrics) {
    return locale === "zh"
      ? `暂无「${name}」的详细分析数据。请尝试：峰林小镇、南岗千年瑶寨、上岳古村、油岭瑶寨、积庆里。`
      : `No detailed analysis for "${name}". Try: Fenglin Town, Nangang Yao Village, etc.`;
  }

  const raiLevel = metrics.rai >= 90 ? "优秀" : metrics.rai >= 80 ? "良好" : "一般";
  const cpiLevel = metrics.cpi >= 95 ? "顶级" : metrics.cpi >= 85 ? "优秀" : "良好";
  const vsiLevel = metrics.vsi >= 90 ? "非常安全" : metrics.vsi >= 80 ? "安全" : "需注意";

  return `## ${name} 深度分析

### 核心指数
| 指标 | 分数 | 评级 |
|------|------|------|
| RAI 可达性 | ${metrics.rai}/100 | ${raiLevel} |
| CPI 文化保护 | ${metrics.cpi}/100 | ${cpiLevel} |
| VSI 安全指数 | ${metrics.vsi}/100 | ${vsiLevel} |

### 年度客流
- 年均游客：${(metrics.visitors / 10000).toFixed(1)}万人次
- 最适合：${metrics.bestFor.join("、")}

### AI建议
${metrics.rai >= 90 ? "- 交通便利，适合自驾/公共交通" : "- 建议自驾前往，公共交通不便"}
${metrics.cpi >= 95 ? "- 文化保护顶级，建议深度体验非遗项目" : "- 文化特色鲜明，建议参与当地体验"}
${metrics.vsi >= 90 ? "- 安全系数高，适合携带老人和儿童" : "- 注意安全提示，做好出行准备"}`;
}

function generateComparison(
  names: string[],
  docs: { title: string; content: string }[],
  locale: string
): string {
  const valid = names.filter((n) => VILLAGE_METRICS[n]);
  if (valid.length < 2) {
    return locale === "zh" ? "请提供至少2个有效村落名进行对比。" : "Please provide at least 2 valid village names.";
  }

  let table = `## 村落对比分析\n\n| 指标 | ${valid.join(" | ")} |\n|------|${valid.map(() => "------").join("|")}|\n`;
  table += `| RAI | ${valid.map((n) => VILLAGE_METRICS[n].rai).join(" | ")} |\n`;
  table += `| CPI | ${valid.map((n) => VILLAGE_METRICS[n].cpi).join(" | ")} |\n`;
  table += `| VSI | ${valid.map((n) => VILLAGE_METRICS[n].vsi).join(" | ")} |\n`;
  table += `| 年客流(万) | ${valid.map((n) => (VILLAGE_METRICS[n].visitors / 10000).toFixed(1)).join(" | ")} |\n`;

  const best = valid.reduce((a, b) =>
    (VILLAGE_METRICS[a].rai + VILLAGE_METRICS[a].cpi + VILLAGE_METRICS[a].vsi) >
    (VILLAGE_METRICS[b].rai + VILLAGE_METRICS[b].cpi + VILLAGE_METRICS[b].vsi) ? a : b
  );

  table += `\n### 综合推荐：**${best}**\n综合指数最高（${VILLAGE_METRICS[best].rai + VILLAGE_METRICS[best].cpi + VILLAGE_METRICS[best].vsi}/300）`;
  return table;
}

function generateTrendInsight(
  name: string,
  docs: { title: string; content: string }[],
  locale: string
): string {
  const metrics = VILLAGE_METRICS[name];
  if (!metrics) return locale === "zh" ? "暂无趋势数据。" : "No trend data available.";

  return `## ${name} 趋势洞察

### 发展态势
- 文化保护投入持续增加，CPI指数稳定在${metrics.cpi}+
- ${metrics.rai >= 85 ? "交通基建完善，可达性持续改善" : "交通基建仍有提升空间"}
- ${metrics.visitors > 30000 ? "客流量稳步增长，需关注承载力" : "客流适中，游客体验优质"}

### 建议关注
- 季节性客流波动管理
- 社区受益分配(CBT)透明化
- 非遗传承人培养计划`;
}

function generateDecisionSupport(
  context: string,
  docs: { title: string; content: string }[],
  locale: string
): string {
  const relevantDocs = docs.slice(0, 2);

  return `## 决策支持分析

### 参考数据
${relevantDocs.map((d) => `- **${d.title}**：${d.content.substring(0, 100)}...`).join("\n")}

### 建议
基于RAG知识库${docs.length}篇相关文档分析：
1. 优先考虑RAI和VSI双高的村落（峰林小镇、上岳古村）
2. 文化深度体验选择CPI高分村落（千年瑶寨、油岭瑶寨）
3. 预算有限时上岳古村是最佳选择（免费参观+交通便利）
4. 结合季节和节庆活动做最终决策

需要更详细的分析请提供具体决策场景。`;
}
