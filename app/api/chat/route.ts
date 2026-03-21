import { NextRequest, NextResponse } from "next/server";
import { retrieveDocuments, classifyIntent } from "@/lib/rag/knowledge-base";

// ═══════════════════════════════════════════════════════
// AI Chat API — RAG增强 + LLM调用 + 三级降级
// Level 1: RAG检索 → 外部LLM API (OpenAI-compatible)
// Level 2: RAG检索 → 本地模板引擎
// Level 3: 纯本地规则匹配 (离线可用)
// ═══════════════════════════════════════════════════════

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  locale?: "zh" | "en";
}

const SYSTEM_PROMPT = `你是「小智」，清远旅游AI助手，由智游清远（SmartTravel）团队开发。

你的能力：
1. 智能行程规划 — 根据用户时间、预算、偏好生成个性化方案
2. 村落推荐 — 基于RAI/CPI/VSI指数推荐最适合的村落
3. 路线规划 — 优化最佳出行路线
4. 实时信息 — 天气、人流、节庆活动查询
5. 文化导览 — 瑶族/客家/广府文化深度讲解
6. 摄影攻略 — 推荐最佳拍摄地点和时间

你服务的区域：广东省清远市5大核心村落（含GIS空间数据）
- 峰林小镇（英德） — 喀斯特峰林，温泉度假 | 坐标: 24.18°N, 112.32°E | 海拔: 120m | 地形: 谷地
- 南岗千年瑶寨（连南） — 瑶族文化，国家非遗 | 坐标: 24.72°N, 112.38°E | 海拔: 803m | 地形: 山地
- 上岳古村（佛冈） — 广府古建筑，锅耳墙 | 坐标: 23.87°N, 113.53°E | 海拔: 45m | 地形: 平原
- 油岭瑶寨（连南） — 耍歌堂发源地，原生态 | 坐标: 24.68°N, 112.28°E | 海拔: 760m | 地形: 山地
- 积庆里（英德） — 英德红茶，客家文化 | 坐标: 24.15°N, 113.38°E | 海拔: 85m | 地形: 丘陵

村落空间关系（认知地图）：
- 南岗瑶寨 ↔ 油岭瑶寨：相距约8km，同属连南县，两寨可联游
- 峰林小镇 ↔ 积庆里：相距约90km，同属英德市，可串联自驾
- 峰林小镇 ↔ 油岭瑶寨：相距约38km，从谷地到山地，海拔差640m
- 上岳古村 ↔ 积庆里：相距约60km，上岳在东南方
- 上岳古村 ↔ 峰林小镇：相距约130km，跨清远东西两端

回答规则：
- 使用Markdown格式回答，善用表格、列表和标题
- 行程规划时给出具体时间表和预算估算
- 标注RAI(可达性)/CPI(文化保护)/VSI(安全)指数
- 提供文化敏感提醒（如禁拍区域）
- 推荐CBT认证商家（社区受益追踪）
- 回答要专业但亲切，像一个经验丰富的本地导游

超出旅游范围的问题处理：
- 当用户提出与清远旅游无关的问题时（如历史、科学、文化常识等），你仍然要尽力回答
- 先用你的通用知识给出有用的回答，然后自然地引导回清远旅游话题
- 绝对不要说"这个问题超出了我的专业范围"或拒绝回答
- 例如用户问姓氏起源，你可以先简要回答，再提到清远地区相关的宗祠文化（如上岳古村）
- 保持友好和知识丰富的形象，展现AI助手的全面能力`;

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, locale = "zh" } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1]?.content || "";
    const conversationHistory = messages.slice(-6); // 保留最近6轮对话

    // ── RAG检索 (BM25+TF-IDF混合) ─────────────────
    const intent = classifyIntent(userMessage);
    const retrievedDocs = retrieveDocuments(userMessage, 5);
    const ragContext = retrievedDocs.length > 0
      ? retrievedDocs
          .map((d, i) => `[知识库${i + 1}] 《${d.title}》（分类: ${d.category}，标签: ${d.tags.slice(0, 4).join("/")}）\n${d.content}`)
          .join("\n\n---\n\n")
      : "";

    // ── Level 1: 外部LLM API (OpenAI-compatible / Anthropic Claude) ──
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    // Anthropic Claude: 检测 ANTHROPIC_API_KEY 或 model 以 "claude-" 开头
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const isClaudeModel = model.startsWith("claude-") || !!anthropicKey;

    if (apiKey || anthropicKey) {
      try {
        const systemMessage = ragContext
          ? `${SYSTEM_PROMPT}\n\n═══ 知识库检索结果 (BM25+TF-IDF混合检索，共${retrievedDocs.length}条) ═══\n请优先基于以下知识库内容回答，同时结合你的通用知识补充细节：\n\n${ragContext}\n\n═══ 回答要求 ═══\n- 回答时自然引用知识库信息，不要机械复读\n- 数据和事实以知识库为准\n- 涉及费用/时间等给出范围而非精确值`
          : SYSTEM_PROMPT;

        let content: string | null = null;

        if (isClaudeModel && anthropicKey) {
          // ── Anthropic Claude API ──
          const claudeMessages = conversationHistory
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

          const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": anthropicKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model,
              max_tokens: 2000,
              system: systemMessage,
              messages: claudeMessages,
              temperature: 0.7,
            }),
          });
          if (claudeRes.ok) {
            const claudeData = await claudeRes.json();
            content = claudeData.content?.[0]?.text || null;
          } else {
            console.warn("[Chat] Claude API error:", await claudeRes.text());
          }
        } else {
          // ── OpenAI-compatible API ──
          const llmMessages = [
            { role: "system", content: systemMessage },
            ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
          ];

          const llmResponse = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: llmMessages,
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });

          if (llmResponse.ok) {
            const data = await llmResponse.json();
            content = data.choices?.[0]?.message?.content || null;
          } else {
            console.warn("[Chat] LLM API returned non-ok:", llmResponse.status);
          }
        }

        if (content) {
          return NextResponse.json({
            content,
            source: "llm",
            model,
            intent,
            ragDocsUsed: retrievedDocs.length,
            timestamp: Date.now(),
          });
        }
        console.warn("[Chat] LLM returned empty, falling back to template engine");
      } catch (llmError) {
        console.warn("[Chat] LLM API error, falling back:", llmError);
      }
    }

    // ── Level 2: RAG + 本地模板引擎 ─────────────────
    if (retrievedDocs.length > 0) {
      const templateResponse = generateTemplateResponse(userMessage, intent, retrievedDocs, locale);
      return NextResponse.json({
        content: templateResponse,
        source: "template",
        intent,
        ragDocsUsed: retrievedDocs.length,
        timestamp: Date.now(),
      });
    }

    // ── Level 3: 纯本地规则匹配 ─────────────────────
    const fallbackResponse = generateFallbackResponse(userMessage, locale);
    return NextResponse.json({
      content: fallbackResponse,
      source: "fallback",
      intent,
      ragDocsUsed: 0,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Chat API Error]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── 本地模板引擎 ─────────────────────────────────────
function generateTemplateResponse(
  query: string,
  intent: string,
  docs: { title: string; content: string; category: string }[],
  locale: string
): string {
  const primaryDoc = docs[0];

  switch (intent) {
    case "planning":
      return generatePlanningResponse(query, docs, locale);
    case "village":
      return generateVillageResponse(docs, locale);
    case "culture":
      return generateCultureResponse(docs, locale);
    case "food":
      return generateFoodResponse(docs, locale);
    case "transport":
      return generateTransportResponse(docs, locale);
    case "photography":
      return generatePhotographyResponse(docs, locale);
    case "budget":
      return generateBudgetResponse(docs, locale);
    case "season":
      return generateSeasonResponse(query, docs, locale);
    case "accommodation":
      return generateAccommodationResponse(docs, locale);
    default:
      return formatRAGResponse(primaryDoc, locale);
  }
}

function generatePlanningResponse(
  query: string,
  docs: { title: string; content: string }[],
  locale: string
): string {
  const q = query.toLowerCase();
  // 提取天数
  let days = 3;
  const dayMatch = query.match(/(\d+)\s*[天日d]/i);
  if (dayMatch) days = parseInt(dayMatch[1]);

  // 提取预算
  let budget = "";
  const budgetMatch = query.match(/(\d+)\s*[元块¥]/);
  if (budgetMatch) budget = `¥${budgetMatch[1]}`;

  // 从知识库中提取村落信息
  const villageDocs = docs.filter((d) => d.content.includes("核心指数"));
  const villageNames = villageDocs.map((d) => d.title.split("·")[0].trim()).slice(0, days);

  let response = `已为您智能规划行程！\n\n## ${days}天行程方案\n\n`;

  if (q.includes("老人") || q.includes("小孩") || q.includes("亲子") || q.includes("family")) {
    response += `> 已启用**适老适童模式** — 优先平坦路线、无障碍通道\n\n`;
  }
  if (q.includes("瑶族") || q.includes("文化") || q.includes("culture")) {
    response += `> 已启用**文化深度模式** — 优先CPI高分村落\n\n`;
  }

  // 生成每日行程
  const allVillages = [
    { name: "峰林小镇", activities: ["峰林徒步观光", "竹筏漂流", "温泉养生"], transport: "广州出发约2.5h" },
    { name: "南岗千年瑶寨", activities: ["瑶族文化参观", "长鼓舞体验", "瑶族服饰试穿"], transport: "英德出发约1.5h" },
    { name: "上岳古村", activities: ["锅耳墙建筑参观", "宗祠文化体验", "古村摄影"], transport: "广州出发约1.5h" },
    { name: "油岭瑶寨", activities: ["耍歌堂仪式", "刺绣体验", "原生态徒步"], transport: "连南县城出发约1h" },
    { name: "积庆里", activities: ["茶园采茶", "制茶体验", "品茗鉴赏"], transport: "广州出发约2h" },
  ];

  const selectedVillages = selectVillages(q, allVillages, days);

  for (let i = 0; i < Math.min(days, selectedVillages.length); i++) {
    const v = selectedVillages[i];
    response += `### Day ${i + 1} — ${v.name}\n`;
    response += `| 时间 | 活动 | 备注 |\n|------|------|------|\n`;
    if (i === 0) {
      response += `| 09:00 | 出发前往${v.name} | ${v.transport} |\n`;
      response += `| 12:00 | 当地特色午餐 | 推荐指数 5/5 |\n`;
    } else {
      response += `| 08:30 | 出发前往${v.name} | ${v.transport} |\n`;
      response += `| 12:00 | 当地特色午餐 | 当地特色 |\n`;
    }
    v.activities.forEach((act, idx) => {
      const time = 14 + idx;
      response += `| ${time}:00 | ${act} | 推荐体验 |\n`;
    });
    if (i < days - 1) {
      response += `| 18:00 | 入住当地住宿 | 民宿/酒店 |\n\n`;
    } else {
      response += `| 16:00 | 返程 | 安全到家 |\n\n`;
    }
  }

  // 预算估算
  const estimatedBudget = days * 600 + 300;
  response += `### 预算估算\n`;
  response += `- 交通：约¥${days * 150}（油费+过路费）\n`;
  response += `- 住宿：约¥${(days - 1) * 350}（${days - 1}晚）\n`;
  response += `- 餐饮：约¥${days * 150}（${days * 2}餐）\n`;
  response += `- 门票+活动：约¥${days * 100}\n`;
  response += `- **总计：约¥${estimatedBudget}**`;
  if (budget) response += `（${parseInt(budget.replace("¥", "")) >= estimatedBudget ? "在" : "略超"}预算范围）`;
  response += `\n\n`;

  // 从RAG知识库补充信息
  const tips = docs.find((d) => d.content.includes("注意事项") || d.content.includes("提醒"));
  if (tips) {
    response += `### 贴心提醒\n`;
    const tipsContent = tips.content.match(/【注意事项】([\s\S]*?)(?=【|$)/);
    if (tipsContent) {
      const lines = tipsContent[1].trim().split("\n").filter(Boolean).slice(0, 4);
      lines.forEach((line) => response += `${line.trim()}\n`);
    } else {
      response += `- 建议穿运动鞋，带防晒用品\n- 提前查看天气预报\n`;
    }
  }

  response += `\n需要我调整行程或查看详细路线吗？`;
  return response;
}

function selectVillages(
  query: string,
  villages: { name: string; activities: string[]; transport: string }[],
  days: number
): typeof villages {
  const q = query.toLowerCase();
  const scored = villages.map((v) => {
    let score = 0;
    if (q.includes(v.name) || q.includes(v.name.substring(0, 2))) score += 10;
    if ((q.includes("瑶族") || q.includes("文化")) && (v.name.includes("瑶") || v.name.includes("瑶寨"))) score += 5;
    if ((q.includes("茶") || q.includes("温泉")) && (v.name.includes("积庆") || v.name.includes("峰林"))) score += 5;
    if ((q.includes("古村") || q.includes("建筑")) && v.name.includes("上岳")) score += 5;
    if ((q.includes("摄影") || q.includes("拍摄")) && (v.name.includes("峰林") || v.name.includes("上岳"))) score += 3;
    if ((q.includes("老人") || q.includes("亲子")) && (v.name.includes("峰林") || v.name.includes("上岳"))) score += 3;
    if (q.includes("穷游") && (v.name.includes("上岳") || v.name.includes("峰林"))) score += 3;
    return { ...v, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, days);
}

function generateVillageResponse(docs: { title: string; content: string }[], locale: string): string {
  let response = `## 村落详情\n\n`;
  for (const doc of docs.slice(0, 2)) {
    response += formatRAGResponse(doc, locale) + "\n\n---\n\n";
  }
  response += `需要我为您规划前往这些村落的行程吗？`;
  return response;
}

function generateCultureResponse(docs: { title: string; content: string }[], locale: string): string {
  let response = `## 文化导览\n\n`;
  for (const doc of docs.slice(0, 2)) {
    response += formatRAGResponse(doc, locale) + "\n\n";
  }
  response += `\n需要了解更多文化细节或规划文化主题行程吗？`;
  return response;
}

function generateFoodResponse(docs: { title: string; content: string }[], locale: string): string {
  const foodDoc = docs.find((d) => d.content.includes("必吃"));
  if (foodDoc) return formatRAGResponse(foodDoc, locale) + "\n\n需要推荐特定村落的美食吗？";
  return formatRAGResponse(docs[0], locale);
}

function generateTransportResponse(docs: { title: string; content: string }[], locale: string): string {
  const transDoc = docs.find((d) => d.content.includes("自驾路线"));
  if (transDoc) return formatRAGResponse(transDoc, locale) + "\n\n需要我规划详细路线吗？";
  return formatRAGResponse(docs[0], locale);
}

function generatePhotographyResponse(docs: { title: string; content: string }[], locale: string): string {
  const photoDoc = docs.find((d) => d.content.includes("拍摄地"));
  if (photoDoc) return formatRAGResponse(photoDoc, locale) + "\n\n需要我为您规划摄影路线吗？";
  return formatRAGResponse(docs[0], locale);
}

function generateBudgetResponse(docs: { title: string; content: string }[], locale: string): string {
  const budgetDoc = docs.find((d) => d.content.includes("穷游方案"));
  if (budgetDoc) return formatRAGResponse(budgetDoc, locale) + "\n\n告诉我您的预算，我来定制最优方案！";
  return formatRAGResponse(docs[0], locale);
}

function generateSeasonResponse(query: string, docs: { title: string; content: string }[], locale: string): string {
  const q = query.toLowerCase();
  let seasonDoc = docs[0];
  for (const d of docs) {
    if ((q.includes("春") || q.includes("3月") || q.includes("4月") || q.includes("5月")) && d.content.includes("春季")) seasonDoc = d;
    if ((q.includes("夏") || q.includes("6月") || q.includes("7月") || q.includes("8月")) && d.content.includes("夏季")) seasonDoc = d;
    if ((q.includes("秋") || q.includes("9月") || q.includes("10月") || q.includes("11月")) && d.content.includes("秋季")) seasonDoc = d;
    if ((q.includes("冬") || q.includes("12月") || q.includes("1月") || q.includes("2月")) && d.content.includes("冬季")) seasonDoc = d;
  }
  return formatRAGResponse(seasonDoc, locale) + "\n\n需要我根据季节推荐行程吗？";
}

function generateAccommodationResponse(docs: { title: string; content: string }[], locale: string): string {
  const accomDoc = docs.find((d) => d.content.includes("住宿"));
  if (accomDoc) return formatRAGResponse(accomDoc, locale) + "\n\n需要我帮您推荐具体住宿吗？";
  return formatRAGResponse(docs[0], locale);
}

function formatRAGResponse(doc: { title: string; content: string }, locale: string): string {
  // 将知识库文档格式化为Markdown
  let content = doc.content;

  // 转换【标题】为 ### 标题
  content = content.replace(/【(.+?)】/g, "\n### $1\n");
  // 转换编号列表
  content = content.replace(/^(\d+)\.\s/gm, "- **$1.** ");

  return `### ${doc.title}\n\n${content}`;
}

// ── 纯本地规则匹配（离线降级）──────────────────────
function generateFallbackResponse(query: string, locale: string): string {
  const q = query.toLowerCase();

  if (q.includes("老人") || q.includes("小孩") || q.includes("亲子") || q.includes("family")) {
    return FALLBACK_RESPONSES.family;
  }
  if (q.includes("瑶族") || q.includes("文化") || q.includes("culture") || q.includes("yao")) {
    return FALLBACK_RESPONSES.culture;
  }
  if (q.includes("茶") || q.includes("温泉") || q.includes("tea") || q.includes("spring")) {
    return FALLBACK_RESPONSES.tea;
  }
  if (q.includes("摄影") || q.includes("拍摄") || q.includes("photo") || q.includes("camera")) {
    return FALLBACK_RESPONSES.photo;
  }
  if (q.includes("穷游") || q.includes("背包") || q.includes("budget") || q.includes("省钱")) {
    return FALLBACK_RESPONSES.budget;
  }
  if (q.includes("安静") || q.includes("疗愈") || q.includes("heal") || q.includes("quiet")) {
    return FALLBACK_RESPONSES.healing;
  }

  return FALLBACK_RESPONSES.general;
}

const FALLBACK_RESPONSES: Record<string, string> = {
  family: `已为您规划「亲子瑶乡文化之旅」！

## 3天2夜行程方案

### Day 1 — 峰林小镇 · 田园初体验
| 时间 | 活动 | 适老/适童指数 |
|------|------|-------------|
| 09:00 | 广州出发 → 英德峰林小镇 | 自驾 2.5h平坦路 |
| 12:00 | 农家午餐（本地走地鸡） | 推荐指数 5/5 |
| 14:00 | 竹筏漂流（平缓水域） | 老人适宜 · 儿童适宜 |
| 16:00 | 茶园采茶体验 | 老人适宜 · 儿童适宜 |
| 18:00 | 温泉酒店入住 | 药浴推荐 |

### Day 2 — 千年瑶寨 · 文化深度
| 时间 | 活动 | 特色 |
|------|------|------|
| 08:30 | 出发前往连南 | 自驾 1.5h |
| 10:30 | 南岗千年瑶寨参观 | 平坦步道 |
| 12:00 | 瑶族特色午餐 | 竹筒饭 |
| 14:00 | 长鼓舞表演观赏 | 国家级非遗 |
| 15:30 | 瑶族服饰试穿拍照 | 适合全家 |
| 17:00 | 返回住宿 | 瑶寨民宿 |

### Day 3 — 上岳古村 · 返程
| 时间 | 活动 | 亮点 |
|------|------|------|
| 09:00 | 上岳古村参观 | 锅耳墙建筑 |
| 11:00 | 古村手工体验 | 适合小朋友 |
| 12:30 | 午餐后返程 | 自驾 1.5h回广州 |

### 预算估算
- 交通：约¥600
- 住宿：约¥800（2晚）
- 餐饮：约¥600
- 门票+活动：约¥500
- **总计：约¥2,500**

需要我调整行程或查看详细路线吗？`,

  culture: `为您推荐「瑶族文化深度体验」方案！

## 瑶族文化3日深度游

### 文化保护指数(CPI)最高的两个村落
1. **南岗千年瑶寨** — CPI: 98/100
2. **油岭瑶寨** — CPI: 96/100

### Day 1 — 南岗千年瑶寨
- 排瑶古建筑群参观（千年历史）
- 长鼓舞教学体验（国家级非遗传承人亲授）
- 瑶族传统服饰试穿
- 瑶族特色餐：竹筒饭 + 腊肉 + 瑶家三宝
- 篝火晚会 + 瑶族山歌对唱

### Day 2 — 油岭瑶寨
- 耍歌堂仪式观摩（发源地！）
- 瑶族刺绣工坊（非遗传承人指导）
- 原生态瑶山徒步
- 瑶药识别 + 药浴体验

### Day 3 — 文化体验收尾
- 瑶族银饰制作体验
- 民族服饰外拍
- 瑶族手工艺品选购（CBT认证商家）

### 预算：约¥2,800

### 文化敏感提醒
- AI已自动标注禁止拍摄区域
- 部分宗教仪式需提前预约
- 尊重当地习俗，跟随导游指引

需要调整吗？`,

  tea: `为您规划「周末茶园温泉之旅」！

## 2天1夜轻松行程

### Day 1 — 积庆里茶园
- 09:00 广州出发 → 英德积庆里（约2h）
- 11:00 百年茶园参观 + 采茶体验
- 13:00 制茶工坊体验（揉捻 → 发酵 → 烘干）
- 15:00 品茗鉴赏课（英德红茶品鉴）
- 17:00 峰林小镇温泉（药浴推荐）
- 住宿温泉度假酒店

### Day 2 — 峰林风光
- 07:00 晨起观峰林日出
- 09:00 峰林徒步（轻松路线约2h）
- 12:00 农家午餐后返程

### 预算：约¥1,200/人
RAI可达性：92/100 — 路况极佳`,

  photo: `摄影爱好者专属推荐！

## 清远 Top 5 拍摄地

### 1. 英西峰林走廊 — 日出/日落金光
- **最佳机位**: 观景台制高点
- **最佳时间**: 6:30-7:30 / 17:30-18:30
- **推荐天气**: 雨后初晴
- **推荐镜头**: 16-35mm 广角

### 2. 千年瑶寨古建筑群 — 人文纪实
- **最佳机位**: 寨门入口仰拍
- **推荐镜头**: 35mm/50mm 定焦

### 3. 上岳古村锅耳墙 — 建筑几何
- **最佳机位**: 村内巷道透视
- **推荐镜头**: 24-70mm

### 4. 油岭瑶寨梯田 — 航拍大片
- **最佳时间**: 5-6月水田期最美
- **推荐**: DJI Mavic 系列

### 5. 积庆里茶园 — 绿色韵律
- **最佳时间**: 3-5月新芽嫩绿
- **推荐镜头**: 70-200mm

需要我为您规划摄影路线吗？`,

  budget: `穷游清远攻略来了！

## 2天1夜穷游方案（¥500以内/人）

### Day 1
- 08:00 广州拼车出发 → 上岳古村（约¥50）
- 10:00 上岳古村（免费参观！）
- 12:00 农家菜午餐（¥40/人）
- 14:00 → 峰林小镇（约¥30拼车）
- 15:00 峰林徒步（免费！）
- 18:00 青旅/农家院住宿（¥80-120/晚）

### Day 2
- 07:00 观峰林日出（免费！）
- 09:00 峰林骑行/徒步
- 12:00 午餐后返程

### 预算：约¥400-500/人

### 省钱技巧
- 工作日出行住宿便宜50%
- 拼车平台找同行伙伴
- 上岳古村+峰林徒步均免费
- 自带干粮减少餐饮开支`,

  healing: `为您推荐清远最安静的「疗愈之旅」

## 2天慢旅行方案

### Day 1 — 积庆里 · 茶园冥想
- 09:00 广州出发 → 英德积庆里（约2h）
- 11:00 茶园漫步，感受自然
- 13:00 素食午餐
- 14:30 品茗冥想课（英德红茶）
- 17:00 温泉度假酒店（药浴）
- 晚间：远离手机，听虫鸣入睡

### Day 2 — 峰林小镇 · 田园呼吸
- 06:30 峰林日出（最治愈的时刻）
- 08:00 晨间瑜伽/太极
- 10:00 田园骑行
- 12:00 农家午餐后缓慢返程

### 推荐理由
- 积庆里游客较少，非常安静
- 峰林小镇远离城市喧嚣
- VSI安全指数均>90`,

  general: `感谢您的提问！作为清远旅游AI助手「小智」，我尽力为您解答各类问题。

关于您的问题，我建议可以从以下角度了解更多：
- 查阅相关专业资料或咨询专家获取更详细的信息
- 如果问题涉及历史文化，清远地区也有丰富的文化遗产可供探索

---

不过，如果您对清远地区的**宗祠文化**感兴趣，我倒是可以推荐您去：

**上岳古村** — 保存完好的广府宗祠群，可以了解岭南地区的宗族制度和祠堂文化。村内有多座不同姓氏的宗祠，展现了传统家族文化的传承。

需要我为您规划一条文化探访路线吗？`,
};
