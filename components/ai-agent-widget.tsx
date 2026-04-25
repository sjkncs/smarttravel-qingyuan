"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, Send, X, Mountain, Globe, Sparkles,
  Loader2, MessageSquare, Plus, Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import MarkdownRenderer from "@/components/markdown-renderer";

const QUICK_PROMPTS = [
  { label: "行程规划", icon: "🗺️", text: "帮我规划3天2夜清远深度游行程" },
  { label: "村落推荐", icon: "🏘️", text: "推荐适合亲子游的清远村落" },
  { label: "文化导览", icon: "🏛️", text: "介绍一下瑶族耍歌堂文化" },
  { label: "美食攻略", icon: "🍜", text: "清远有哪些必吃的特色美食？" },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function AIAgentPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = { id: generateId(), role: "user", content: msg, timestamp: new Date() };
    const replyId = generateId();
    setMessages((prev) => [...prev, userMsg, { id: replyId, role: "assistant", content: "", timestamp: new Date() }]);
    setLoading(true);

    try {
      const history = [...messages, userMsg].slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, locale: "zh" }),
      });

      if (!res.ok) throw new Error("Stream failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

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
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              const acc = accumulated;
              setMessages((prev) =>
                prev.map((m) => (m.id === replyId ? { ...m, content: acc } : m))
              );
            }
          } catch { /* skip */ }
        }
      }

      if (!accumulated) {
        setMessages((prev) =>
          prev.map((m) => (m.id === replyId ? { ...m, content: "抱歉，暂时无法回答您的问题。" } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === replyId ? { ...m, content: "网络连接异常，请稍后重试。" } : m))
      );
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 transition-transform"
            aria-label="打开AI助手"
            title="小智AI助手"
          >
            <Bot className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Agent panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Mountain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">小智 · AI助手</h3>
                  <p className="text-[10px] text-muted-foreground">SSE流式 · RAG增强</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                    aria-label="清空对话"
                    title="新对话"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                  aria-label="关闭"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center min-h-full py-8">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
                    <Bot className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold mb-1">你好，我是小智</h2>
                  <p className="text-muted-foreground text-xs mb-6 text-center">清远旅游AI助手，随时为您服务</p>
                  <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => sendMessage(p.text)}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-all text-left text-xs"
                      >
                        <span>{p.icon}</span>
                        <span className="font-medium">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.filter((m) => m.role === "user" || m.content).map((m) => (
                  <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    {m.role === "assistant" && (
                      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-emerald-500 text-white rounded-tr-sm"
                          : "bg-muted/60 rounded-tl-sm"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <MarkdownRenderer content={m.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}

              {loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].content && (
                <div className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                    <span className="text-xs text-muted-foreground ml-1">思考中...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="relative rounded-xl border border-border bg-muted/30 focus-within:border-emerald-500/60 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="向小智提问..."
                  rows={1}
                  disabled={loading}
                  className="w-full px-3.5 pt-3 pb-10 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                />
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white transition-all"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-1.5">
                小智由清远旅游知识库驱动 · 仅供旅游参考
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AIAgentWidget() {
  return (
    <Suspense fallback={null}>
      <AIAgentPanel />
    </Suspense>
  );
}
