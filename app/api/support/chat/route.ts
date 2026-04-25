import { NextRequest } from "next/server";
import { searchSupportKB, classifySupportIntent, getQuickReply } from "@/lib/support/knowledge-base";
import { prisma } from "@/lib/prisma";

// ══════════════════════════════════════════════════════════════════
// 智能客服 RAG Chat API — SSE 流式输出
// 参考: 美团智能客服多轮对话架构 / 淘宝万象平台知识检索
// ══════════════════════════════════════════════════════════════════

const SUPPORT_SYSTEM_PROMPT = `你是「小帮」，智游乡野平台的智能客服助手，由SmartTravel团队开发。

你的职责：
1. 解答用户关于平台使用的各类问题
2. 协助用户完成账号、支付、行程规划等操作
3. 处理投诉和建议，必要时转接人工客服
4. 提供清远旅游相关的权威信息

回答规则：
- 回答要简洁、友好、专业，像一个经验丰富的客服专员
- 优先使用知识库中的信息，保证准确性
- 对于不确定的问题，说明情况并建议联系人工客服
- 遇到复杂/情绪化问题，主动提议转人工客服
- 使用表情符号增加亲和力，但不要过多

人工客服转接规则：
- 用户明确说「转人工」「人工客服」「要投诉」时，立即触发转接
- 用户强烈不满（连续3次负面反馈）时主动建议转人工
- 涉及退款金额>500元、账号申诉等复杂情况时建议转人工

重要信息：
- 人工客服服务时间：09:00-22:00（节假日不间断）
- 当前平台版本：v1.0`;

function createSSEStream(gen: AsyncGenerator<string>): ReadableStream {
  const enc = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of gen) {
          controller.enqueue(enc.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
        }
        controller.enqueue(enc.encode(`data: [DONE]\n\n`));
        controller.close();
      } catch (e) {
        controller.enqueue(enc.encode(`data: ${JSON.stringify({ error: String(e) })}\n\n`));
        controller.close();
      }
    },
  });
}

async function* streamText(text: string): AsyncGenerator<string> {
  const chunks = text.match(/.{1,4}/g) || [];
  for (const chunk of chunks) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 30));
  }
}

async function* streamFromLLM(
  messages: { role: string; content: string }[],
  system: string,
  apiKey: string,
  baseUrl: string,
  model: string
): AsyncGenerator<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.5,
      max_tokens: 800,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`LLM error ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data: ")) continue;
      const d = t.slice(6);
      if (d === "[DONE]") return;
      try {
        const delta = JSON.parse(d)?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* skip */ }
    }
  }
}

async function* streamFromAnthropic(
  messages: { role: string; content: string }[],
  system: string,
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
      model: model.startsWith("claude-") ? model : "claude-sonnet-4-20250514",
      system,
      messages: claudeMessages,
      max_tokens: 800,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) throw new Error(`Anthropic error ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data: ")) continue;
      try {
        const evt = JSON.parse(t.slice(6));
        if (evt.type === "content_block_delta" && evt.delta?.text) {
          yield evt.delta.text;
        }
      } catch { /* skip */ }
    }
  }
}

function buildFallbackAnswer(query: string, kbEntries: ReturnType<typeof searchSupportKB>): string {
  if (kbEntries.length === 0) {
    return `感谢您的咨询 😊\n\n很抱歉，我没有找到关于「${query}」的直接答案。\n\n您可以：\n1. 换个关键词重新描述问题\n2. 输入「转人工」联系人工客服\n\n⏰ 人工客服服务时间：09:00-22:00`;
  }
  const top = kbEntries[0];
  let ans = top.answer;
  if (kbEntries.length > 1) {
    ans += `\n\n---\n💡 **相关问题：**\n${kbEntries.slice(1, 3).map((e) => `- ${e.question}`).join("\n")}`;
  }
  return ans;
}

// Detect human escalation request
function needsHumanAgent(query: string): boolean {
  return /转人工|人工客服|要投诉|真人|要人工|不要机器人|投诉|退款申请/.test(query);
}

export async function POST(req: NextRequest) {
  try {
    const { messages, ticketId, sessionId } = await req.json();
    if (!messages?.length) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }

    const userQuery = messages[messages.length - 1]?.content || "";

    // 1. Quick reply check (< 1ms)
    const quick = getQuickReply(userQuery);
    if (quick && !needsHumanAgent(userQuery)) {
      return new Response(createSSEStream(streamText(quick)), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "X-Support-Intent": "quick_reply",
        },
      });
    }

    // 2. Human escalation check
    if (needsHumanAgent(userQuery)) {
      // Update ticket status if ticketId provided
      if (ticketId) {
        try {
          await prisma!.supportTicket.update({
            where: { id: ticketId },
            data: { status: "HUMAN_QUEUE" },
          });
        } catch { /* DB may not be available */ }
      }
      const escalateMsg = `我已为您发起人工客服请求 👤\n\n**当前排队位置**: 等待中\n**预计等待**: 3-8分钟\n**服务时间**: 09:00-22:00\n\n您的问题已记录，人工客服接入后会看到完整聊天记录，无需重复描述。\n\n💬 在等待期间，您可以继续描述问题，AI会持续协助您。`;
      return new Response(createSSEStream(streamText(escalateMsg)), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Support-Intent": "human_escalation",
          "X-Ticket-Status": "HUMAN_QUEUE",
        },
      });
    }

    // 3. Classify intent + RAG retrieval
    const intent = classifySupportIntent(userQuery);
    const kbResults = searchSupportKB(userQuery, 4);
    const ragContext = kbResults.length > 0
      ? kbResults.map((e, i) => `[知识库${i + 1}] Q: ${e.question}\nA: ${e.answer}`).join("\n\n---\n\n")
      : "";

    // 4. Save message to DB if ticketId
    if (ticketId) {
      try {
        await prisma?.supportMessage.create({
          data: {
            ticketId,
            sender: "USER",
            content: userQuery,
            metadata: JSON.stringify({ intent, ragHits: kbResults.length }),
          },
        });
      } catch { /* DB may not be available */ }
    }

    const systemPrompt = ragContext
      ? `${SUPPORT_SYSTEM_PROMPT}\n\n═══ 知识库检索结果 ═══\n请优先基于以下内容回答，保持准确性：\n\n${ragContext}\n\n═══ 回答要求 ═══\n- 基于知识库简洁回答，不要重复问题\n- 如知识库无法覆盖，给出合理建议并可提议转人工`
      : SUPPORT_SYSTEM_PROMPT;

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const isClaudeModel = model.startsWith("claude-") || !!anthropicKey;

    let stream: ReadableStream;

    if (apiKey || anthropicKey) {
      try {
        const llmMessages = messages.slice(-6).map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        }));
        let generator: AsyncGenerator<string>;
        if (isClaudeModel && anthropicKey) {
          generator = streamFromAnthropic(llmMessages, systemPrompt, anthropicKey, model);
        } else {
          generator = streamFromLLM(llmMessages, systemPrompt, apiKey!, baseUrl, model);
        }
        stream = createSSEStream(generator);
      } catch {
        const fallback = buildFallbackAnswer(userQuery, kbResults);
        stream = createSSEStream(streamText(fallback));
      }
    } else {
      const fallback = buildFallbackAnswer(userQuery, kbResults);
      stream = createSSEStream(streamText(fallback));
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Support-Intent": intent,
        "X-Support-KB-Hits": String(kbResults.length),
      },
    });
  } catch (err) {
    console.error("[Support Chat Error]", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
