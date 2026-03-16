import { NextRequest } from "next/server";
import { retrieveDocuments, classifyIntent } from "@/lib/rag/knowledge-base";
import { generateLocalResponse } from "./local-fallback";

// ═══════════════════════════════════════════════════════
// Streaming Chat API — SSE (Server-Sent Events)
// 支持 OpenAI / Anthropic 流式输出 + 本地降级
// ═══════════════════════════════════════════════════════

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
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
- 在回答末尾标注引用的知识库来源，格式：📚 来源: [文档标题]
- 提供文化敏感提醒（如禁拍区域）
- 推荐CBT认证商家（社区受益追踪）
- 回答要专业但亲切，像一个经验丰富的本地导游

超出旅游范围的问题处理：
- 当用户提出与清远旅游无关的问题时，你仍然要尽力回答
- 先用你的通用知识给出有用的回答，然后自然地引导回清远旅游话题
- 绝对不要说"这个问题超出了我的专业范围"或拒绝回答
- 保持友好和知识丰富的形象，展现AI助手的全面能力

思维链(CoT)规则：
- 收到复杂问题时，先内部分析用户意图(行程规划/文化咨询/实用信息)
- 再根据知识库检索结果组织回答
- 最后标注来源和后续建议

Few-shot示例：
用户: 我想带老人去清远玩2天，有什么推荐？
助手: 为您规划了一条**适老友好**的2天行程！

### Day 1 — 上岳古村（RAI可达性: 88/100）
| 时间 | 活动 | 适老指数 |
|------|------|---------|
| 09:00 | 广州出发 → 上岳古村 | 自驾1.5h，全程高速 |
| 10:30 | 锅耳墙古建筑漫步 | ⭐⭐⭐⭐⭐ 平坦步道 |
| 12:00 | 农家午餐（白切鸡） | 清淡可口 |
| 14:00 | 宗祠文化参观 | 室内为主，遮阳 |
| 16:00 | 前往峰林小镇 | 约1h车程 |
| 17:30 | 温泉酒店入住 | 药浴推荐 |

### Day 2 — 峰林小镇（VSI安全: 95/100）
| 时间 | 活动 | 适老指数 |
|------|------|---------|
| 08:00 | 峰林日出观景 | 酒店阳台即可 |
| 10:00 | 平缓步道散步 | ⭐⭐⭐⭐⭐ |
| 12:00 | 午餐后返程 | 轻松行程 |

**预算**: 约¥1,800/2人（住宿¥500+餐饮¥400+交通¥300+门票¥100）

📚 来源: 上岳古村 · 广府古建筑博物馆 | 峰林小镇 · 英西峰林走廊核心区`;

function createSSEStream(iterator: AsyncIterable<string>): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`));
        controller.close();
      }
    },
  });
}

async function* streamFromOpenAI(
  messages: ChatMessage[],
  systemMessage: string,
  apiKey: string,
  baseUrl: string,
  model: string
): AsyncGenerator<string> {
  const llmMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
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
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`LLM API error: ${res.status}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed JSON
      }
    }
  }
}

async function* streamFromAnthropic(
  messages: ChatMessage[],
  systemMessage: string,
  apiKey: string,
  model: string
): AsyncGenerator<string> {
  const claudeMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemMessage,
      messages: claudeMessages,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          yield parsed.delta.text;
        }
      } catch {
        // skip
      }
    }
  }
}

async function* streamFallback(text: string): AsyncGenerator<string> {
  // Simulate streaming for local fallback responses
  const chars = text.split("");
  let i = 0;
  while (i < chars.length) {
    const chunkSize = Math.min(3 + Math.floor(Math.random() * 5), chars.length - i);
    yield chars.slice(i, i + chunkSize).join("");
    i += chunkSize;
    await new Promise((r) => setTimeout(r, 15 + Math.random() * 25));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, locale = "zh" } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userMessage = messages[messages.length - 1]?.content || "";
    const conversationHistory: ChatMessage[] = messages.slice(-6);

    // RAG retrieval
    const intent = classifyIntent(userMessage);
    const retrievedDocs = retrieveDocuments(userMessage, 5);
    const ragContext = retrievedDocs.length > 0
      ? retrievedDocs
          .map((d, i) => `[知识库${i + 1}] 《${d.title}》（分类: ${d.category}，标签: ${d.tags.slice(0, 4).join("/")}）\n${d.content}`)
          .join("\n\n---\n\n")
      : "";

    const systemMessage = ragContext
      ? `${SYSTEM_PROMPT}\n\n═══ 知识库检索结果 (BM25+TF-IDF混合检索，共${retrievedDocs.length}条) ═══\n请优先基于以下知识库内容回答，同时结合你的通用知识补充细节：\n\n${ragContext}\n\n═══ 回答要求 ═══\n- 回答时自然引用知识库信息，不要机械复读\n- 数据和事实以知识库为准\n- 涉及费用/时间等给出范围而非精确值\n- 回答末尾标注来源：📚 来源: [引用的文档标题]`
      : SYSTEM_PROMPT;

    // Source info for metadata
    const sourceInfo = {
      intent,
      ragDocsUsed: retrievedDocs.length,
      ragSources: retrievedDocs.map((d) => d.title),
    };

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const isClaudeModel = model.startsWith("claude-") || !!anthropicKey;

    let stream: ReadableStream;

    if (apiKey || anthropicKey) {
      try {
        let generator: AsyncGenerator<string>;
        if (isClaudeModel && anthropicKey) {
          generator = streamFromAnthropic(conversationHistory, systemMessage, anthropicKey, model);
        } else {
          generator = streamFromOpenAI(conversationHistory, systemMessage, apiKey!, baseUrl, model);
        }

        // Wrap generator to prepend metadata
        async function* withMetadata() {
          yield `\n`; // signal start
          yield* generator;
        }

        stream = createSSEStream(withMetadata());
      } catch (err) {
        console.warn("[StreamChat] LLM error, falling to local:", err);
        const fallbackText = generateLocalResponse(userMessage, intent, retrievedDocs, locale);
        stream = createSSEStream(streamFallback(fallbackText));
      }
    } else {
      // No API key — use local response with simulated streaming
      const fallbackText = generateLocalResponse(userMessage, intent, retrievedDocs, locale);
      stream = createSSEStream(streamFallback(fallbackText));
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RAG-Intent": intent,
        "X-RAG-Docs-Used": String(sourceInfo.ragDocsUsed),
      },
    });
  } catch (error) {
    console.error("[StreamChat Error]", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
