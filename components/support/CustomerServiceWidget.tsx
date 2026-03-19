"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageCircle, X, Send, ChevronDown, User, Bot,
  Loader2, ThumbsUp, ThumbsDown, RotateCcw, Headphones,
  FileText, CheckCircle, AlertCircle, Minimize2, Maximize2,
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════
type MsgSender = "user" | "ai" | "agent" | "system";
interface ChatMessage {
  id: string;
  sender: MsgSender;
  content: string;
  createdAt: Date;
  streaming?: boolean;
}

type WidgetStatus = "closed" | "open" | "minimized";
type TicketStatus = "AI_HANDLING" | "HUMAN_QUEUE" | "HUMAN_ACTIVE" | "RESOLVED";

const QUICK_QUESTIONS = [
  { num: 1, text: "账号注册/登录问题" },
  { num: 2, text: "支付与价格" },
  { num: 3, text: "行程规划怎么用" },
  { num: 4, text: "村落景点推荐" },
  { num: 5, text: "地图与导航" },
  { num: 6, text: "联系人工客服" },
];

const CATEGORY_OPTIONS = [
  { value: "account", label: "账号问题" },
  { value: "payment", label: "支付/价格" },
  { value: "trip", label: "行程规划" },
  { value: "village", label: "村落信息" },
  { value: "technical", label: "技术故障" },
  { value: "general", label: "其他问题" },
];

// ══════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>")
    .replace(/---/g, "<hr class='my-1 border-gray-200'/>");
}

// ══════════════════════════════════════════════════════════════════
// Main Widget
// ══════════════════════════════════════════════════════════════════
export default function CustomerServiceWidget() {
  const [status, setStatus] = useState<WidgetStatus>("closed");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketStatus, setTicketStatus] = useState<TicketStatus>("AI_HANDLING");
  const [unread, setUnread] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [category, setCategory] = useState("general");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastPollRef = useRef<string | null>(null);

  // Poll for agent messages when in human queue/active
  useEffect(() => {
    if (!ticketId || (ticketStatus !== "HUMAN_QUEUE" && ticketStatus !== "HUMAN_ACTIVE")) return;
    const interval = setInterval(async () => {
      try {
        const afterParam = lastPollRef.current ? `&after=${encodeURIComponent(lastPollRef.current)}` : "";
        const r = await fetch(`/api/support/ticket?poll=${ticketId}${afterParam}`);
        if (!r.ok) return;
        const data = await r.json();
        // Update ticket status from server
        if (data.ticketStatus && data.ticketStatus !== ticketStatus) {
          setTicketStatus(data.ticketStatus as TicketStatus);
          if (data.ticketStatus === "RESOLVED") setShowRating(true);
        }
        // Append new agent messages
        if (data.messages?.length > 0) {
          const newMsgs: ChatMessage[] = data.messages.map((m: { sender: string; content: string; createdAt: string }) => ({
            id: uid(),
            sender: m.sender === "AGENT" ? "agent" : "ai",
            content: m.content,
            createdAt: new Date(m.createdAt),
          }));
          setMessages((prev) => [...prev, ...newMsgs]);
          lastPollRef.current = data.messages[data.messages.length - 1].createdAt;
          if (status !== "open") setUnread((u) => u + newMsgs.length);
        }
      } catch { /* ignore poll errors */ }
    }, 5000);
    return () => clearInterval(interval);
  }, [ticketId, ticketStatus, status]);

  // Welcome message on first open
  useEffect(() => {
    if (status === "open" && messages.length === 0) {
      const welcome: ChatMessage = {
        id: uid(),
        sender: "ai",
        content: "您好，欢迎来到智游清远！我是您的智能客服小帮 😊\n\n请问有什么可以帮助您？\n\n**1.** 账号注册/登录问题\n**2.** 支付与价格\n**3.** 行程规划怎么用\n**4.** 村落景点推荐\n**5.** 地图与导航\n**6.** 联系人工客服\n\n👆 点击上方选项快速提问，或直接输入您的问题，我随时为您解答~",
        createdAt: new Date(),
      };
      setMessages([welcome]);
    }
  }, [status, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (status === "open") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [status]);

  const open = () => {
    setStatus("open");
    setUnread(0);
  };

  const appendAIMsg = useCallback((id: string, content: string, done = false) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === id);
      if (idx === -1) {
        return [...prev, { id, sender: "ai", content, createdAt: new Date(), streaming: !done }];
      }
      const updated = [...prev];
      updated[idx] = { ...updated[idx], content, streaming: !done };
      return updated;
    });
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");

    // Add user message
    const userMsg: ChatMessage = { id: uid(), sender: "user", content: query, createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Create ticket on first real message
    let currentTicketId = ticketId;
    if (!currentTicketId && messages.length <= 1) {
      try {
        const res = await fetch("/api/support/ticket", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: query.slice(0, 80), category, firstMessage: query }),
        });
        const data = await res.json();
        currentTicketId = data.ticket?.id || null;
        setTicketId(currentTicketId);
      } catch { /* ignore */ }
    }

    // Stream AI response
    const aiMsgId = uid();
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const historyMessages = messages.slice(-8).map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
      }));
      historyMessages.push({ role: "user", content: query });

      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyMessages, ticketId: currentTicketId }),
        signal: abortRef.current.signal,
      });

      // Check for escalation
      const intentHeader = res.headers.get("X-Support-Intent");
      const ticketStatusHeader = res.headers.get("X-Ticket-Status");
      if (ticketStatusHeader === "HUMAN_QUEUE") setTicketStatus("HUMAN_QUEUE");

      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullContent = "";

      appendAIMsg(aiMsgId, "", false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const d = line.slice(6).trim();
          if (d === "[DONE]") {
            appendAIMsg(aiMsgId, fullContent, true);
            if (intentHeader === "human_escalation") {
              setTicketStatus("HUMAN_QUEUE");
            }
            break;
          }
          try {
            const chunk = JSON.parse(d);
            if (chunk.content) {
              fullContent += chunk.content;
              appendAIMsg(aiMsgId, fullContent, false);
            }
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      appendAIMsg(aiMsgId, "抱歉，网络似乎出了点问题 😅 请稍后重试，或输入「转人工」联系人工客服。", true);
    } finally {
      setLoading(false);
    }
  }, [input, loading, ticketId, messages, category, appendAIMsg]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const rateSession = async (rating: number) => {
    if (ticketId) {
      try {
        await fetch("/api/support/ticket", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: ticketId, satisfaction: rating, status: "RESOLVED" }),
        });
      } catch { /* ignore */ }
    }
    setShowRating(false);
    const thankMsg: ChatMessage = {
      id: uid(), sender: "system",
      content: rating >= 4 ? "感谢您的好评！祝您旅途愉快 🌟" : "感谢您的反馈，我们会继续改进服务 🙏",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, thankMsg]);
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setTicketId(null);
    setTicketStatus("AI_HANDLING");
    setShowRating(false);
    setInput("");
  };

  // ── Render ──────────────────────────────────────────────────────

  if (status === "closed") {
    return (
      <button
        onClick={open}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        style={{ padding: "12px 20px" }}
        aria-label="打开客服"
      >
        <MessageCircle size={22} />
        <span className="text-sm font-medium">智能客服</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    );
  }

  if (status === "minimized") {
    return (
      <button
        onClick={() => setStatus("open")}
        className="fixed bottom-6 right-6 z-50 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all p-3 flex items-center gap-2"
        aria-label="展开客服"
      >
        <MessageCircle size={22} />
        {unread > 0 && (
          <span className="bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      style={{ width: 380, height: 580, background: "#fff", colorScheme: "light", color: "#111827" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={18} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 border-2 border-emerald-600 rounded-full" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">小帮客服</div>
            <div className="text-xs text-green-100 leading-tight">
              {ticketStatus === "AI_HANDLING" && "AI智能解答"}
              {ticketStatus === "HUMAN_QUEUE" && "⏳ 等待人工接入"}
              {ticketStatus === "HUMAN_ACTIVE" && "👤 人工服务中"}
              {ticketStatus === "RESOLVED" && "✅ 已解决"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && !showRating && (
            <button
              onClick={() => setShowRating(true)}
              title="评价本次服务"
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ThumbsUp size={15} />
            </button>
          )}
          <button onClick={resetChat} title="新对话" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <RotateCcw size={15} />
          </button>
          <button onClick={() => setStatus("minimized")} title="最小化" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Minimize2 size={15} />
          </button>
          <button onClick={() => setStatus("closed")} title="关闭" className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Status banner for human queue */}
      {ticketStatus === "HUMAN_QUEUE" && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs shrink-0">
          <Headphones size={14} className="shrink-0" />
          <span>已进入人工客服队列，请稍候。AI将继续协助您。</span>
        </div>
      )}

      {/* Rating panel */}
      {showRating && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100 shrink-0">
          <span className="text-xs text-blue-700">本次服务满意吗？</span>
          <div className="flex gap-2">
            <button onClick={() => rateSession(5)} className="flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded-full transition-colors">
              <ThumbsUp size={12} /> 满意
            </button>
            <button onClick={() => rateSession(2)} className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-full transition-colors">
              <ThumbsDown size={12} /> 不满意
            </button>
            <button onClick={() => setShowRating(false)} title="关闭评价" className="text-xs text-gray-400 hover:text-gray-600 px-1">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && !messages.some((m) => m.streaming) && (
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Bot size={14} className="text-green-600" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-none px-3 py-2 shadow-sm border border-gray-100">
              <Loader2 size={14} className="animate-spin text-green-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 mb-1.5">常见问题</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.num}
                onClick={() => sendMessage(q.text)}
                className="text-xs bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-600 px-2.5 py-1 rounded-full transition-colors"
              >
                {q.num}. {q.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category picker */}
      {showCategoryPicker && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.value}
                onClick={() => { setCategory(c.value); setShowCategoryPicker(false); }}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${category === c.value ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-green-100"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 px-3 py-3 bg-white border-t border-gray-100 shrink-0" style={{ backgroundColor: "#ffffff" }}>
        <button
          onClick={() => setShowCategoryPicker((v) => !v)}
          title="选择问题类型"
          className="shrink-0 p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        >
          <FileText size={16} />
        </button>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入问题，Enter发送…"
          rows={1}
          className="flex-1 resize-none text-sm rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-green-300 min-h-[36px] max-h-[100px]"
          style={{ backgroundColor: "#f3f4f6", color: "#111827", lineHeight: "1.5" }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="shrink-0 w-8 h-8 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// Message Bubble
// ══════════════════════════════════════════════════════════════════
function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.sender === "system") {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1">
          <CheckCircle size={11} />
          {msg.content}
        </span>
      </div>
    );
  }

  const isUser = msg.sender === "user";
  const isAgent = msg.sender === "agent";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isUser ? "bg-blue-500" : isAgent ? "bg-purple-500" : "bg-green-100"}`}>
        {isUser
          ? <User size={14} className="text-white" />
          : isAgent
          ? <Headphones size={14} className="text-white" />
          : <Bot size={14} className="text-green-600" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
        {!isUser && (
          <span className="text-[10px] text-gray-400 px-1">
            {isAgent ? "人工客服" : "小帮"}
          </span>
        )}
        <div
          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-green-500 text-white rounded-tr-none"
              : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
          } ${msg.streaming ? "after:content-['▋'] after:animate-pulse" : ""}`}
          dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }}
        />
        <span className="text-[10px] text-gray-400 px-1">{fmtTime(msg.createdAt)}</span>
      </div>
    </div>
  );
}
