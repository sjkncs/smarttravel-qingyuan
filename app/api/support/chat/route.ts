import { NextRequest } from "next/server";
import { searchSupportKB, classifySupportIntent, getQuickReply } from "@/lib/support/knowledge-base";
import { prisma } from "@/lib/prisma";

// ══════════════════════════════════════════════════════════════════
// 智能客服 RAG Chat API — SSE 流式输出
// 参考: 美团智能客服多轮对话架构 / 淘宝万象平台知识检索
// ══════════════════════════════════════════════════════════════════

const SUPPORT_SYSTEM_PROMPT = `你是「小帮」，智游清远平台的智能客服助手，由SmartTravel团队开发。

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

// Detect ban/account related queries that AI can try to handle first
function isBanAccountQuery(query: string): boolean {
  return /封禁|被封|禁言|限制|解封|申诉|账号异常|无法登录|账号被|冻结|封号|违规/.test(query);
}

// Detect queries that should auto-escalate (complex issues AI can't resolve)
function shouldAutoEscalate(query: string): boolean {
  return /退款.*\d+|盗号|身份证|银行卡.*问题|资金.*安全|被骗|诈骗|法律|律师/.test(query);
}

// Build ban-specific AI context for account issues
async function getBanContext(ticketId: string | null): Promise<string> {
  if (!ticketId) return "";
  try {
    const ticket = await prisma?.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });
    if (!ticket?.userId) return "";
    // Check if user has active bans
    const bans = await (prisma as any).userBan?.findMany({
      where: {
        userId: ticket.userId,
        status: { in: ["ACTIVE", "APPEALED"] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
    });
    if (!bans || bans.length === 0) return "\n\n该用户当前没有任何封禁记录。";
    const banInfo = bans.map((b: any) =>
      `- 类型: ${b.type === "ACCOUNT" ? "账号封禁" : b.type === "POST" ? "发帖封禁" : b.type === "CHAT" ? "聊天封禁" : "警告"}, 原因: ${b.reason}, 状态: ${b.status === "ACTIVE" ? "生效中" : "申诉中"}, 到期: ${b.expiresAt ? new Date(b.expiresAt).toLocaleString("zh-CN") : "永久"}`
    ).join("\n");
    return `\n\n═══ 用户封禁记录 ═══\n${banInfo}\n\n处理规则：\n- 如果是临时封禁，告知用户到期时间\n- 如果用户想申诉，引导用户说"我要申诉"\n- 严重违规（永久封禁）建议转人工客服处理\n- 不要随意承诺解封`;
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, ticketId, sessionId } = await req.json();
    if (!messages?.length) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }

    const userQuery = messages[messages.length - 1]?.content || "";
    const messageCount = messages.length;

    // 0. Auto-escalation check: if AI has been chatting 6+ rounds without resolution
    if (messageCount >= 12 && !needsHumanAgent(userQuery)) {
      // Check if most recent messages are still questions (not resolved)
      const recentUserMsgs = messages.filter((m: any) => m.role === "user").slice(-3);
      const stillAsking = recentUserMsgs.some((m: any) => /\?|？|怎么|为什么|还是|不行|没用|解决/.test(m.content));
      if (stillAsking) {
        // Auto-escalate: AI couldn't resolve after multiple attempts
        if (ticketId) {
          try {
            await prisma!.supportTicket.update({
              where: { id: ticketId },
              data: { status: "HUMAN_QUEUE", priority: "HIGH" },
            });
            await prisma?.supportMessage.create({
              data: { ticketId, sender: "SYSTEM", content: "[系统] AI多轮对话未解决，自动转接人工客服" },
            });
          } catch { /* DB may not be available */ }
        }
        const autoEscalateMsg = `看起来我还没有完全解决您的问题，我已自动为您转接人工客服 👤\n\n**转接原因**: AI多轮对话未能解决\n**优先级**: 已提升为高优先级\n**预计等待**: 3-5分钟\n\n人工客服会看到我们的完整对话记录，您无需重复描述问题。`;
        return new Response(createSSEStream(streamText(autoEscalateMsg)), {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Support-Intent": "auto_escalation",
            "X-Ticket-Status": "HUMAN_QUEUE",
          },
        });
      }
    }

    // 0b. Complex issues auto-escalate immediately
    if (shouldAutoEscalate(userQuery)) {
      if (ticketId) {
        try {
          await prisma!.supportTicket.update({
            where: { id: ticketId },
            data: { status: "HUMAN_QUEUE", priority: "URGENT" },
          });
          await prisma?.supportMessage.create({
            data: { ticketId, sender: "SYSTEM", content: `[系统] 检测到敏感/复杂问题，自动转接人工: ${userQuery.slice(0, 50)}` },
          });
        } catch { /* DB may not be available */ }
      }
      const urgentMsg = `您反馈的问题涉及重要事项，我已为您**紧急转接**人工客服 🚨\n\n**优先级**: 紧急\n**预计接入**: 1-3分钟\n\n请放心，人工客服会优先处理您的问题。`;
      return new Response(createSSEStream(streamText(urgentMsg)), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Support-Intent": "urgent_escalation",
          "X-Ticket-Status": "HUMAN_QUEUE",
        },
      });
    }

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

    // 4b. If ban/account query, fetch ban context
    let banContext = "";
    if (isBanAccountQuery(userQuery)) {
      banContext = await getBanContext(ticketId);
    }

    const systemPrompt = ragContext || banContext
      ? `${SUPPORT_SYSTEM_PROMPT}${banContext}\n\n═══ 知识库检索结果 ═══\n请优先基于以下内容回答，保持准确性：\n\n${ragContext}\n\n═══ 回答要求 ═══\n- 基于知识库简洁回答，不要重复问题\n- 如知识库无法覆盖，给出合理建议并可提议转人工\n- 对于封禁/账号问题，先查看用户封禁记录再回答\n- AI能处理的：查询封禁状态、解释封禁原因、引导申诉流程\n- AI不能处理的：解封操作、退款审批、身份核实 → 转人工`
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
