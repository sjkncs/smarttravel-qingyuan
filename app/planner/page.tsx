"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mountain, Sparkles, User, Loader2, RotateCcw, MapPin, Calendar, Users as UsersIcon, Wallet, Camera, Tent, Leaf, Theater, Coffee } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MarkdownRenderer from "@/components/markdown-renderer";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

const quickPrompts: { icon: LucideIcon; text: string; textEn: string }[] = [
  { icon: UsersIcon, text: "带老人和小孩，3天2夜清远行程", textEn: "3-day family trip with elderly and kids" },
  { icon: Theater, text: "想深度体验瑶族文化，预算3000元", textEn: "Deep Yao culture experience, ¥3000 budget" },
  { icon: Coffee, text: "周末2天，想去茶园和温泉", textEn: "2-day weekend: tea garden + hot springs" },
  { icon: Camera, text: "摄影爱好者，推荐最佳拍摄地点", textEn: "Photography lover, best shooting spots" },
  { icon: Tent, text: "大学生穷游，背包客路线推荐", textEn: "Budget backpacker route recommendation" },
  { icon: Leaf, text: "疗愈系旅行，找最安静的村落", textEn: "Healing trip, find the quietest village" },
];

const WELCOME_MESSAGE = `您好！我是清远旅游AI助手「小智」。

很高兴为您服务！我可以帮您：
- **智能行程规划** — 根据您的时间、预算、偏好生成个性化方案
- **村落推荐** — 基于RAI/CPI/VSI指数推荐最适合您的村落
- **路线规划** — 优化最佳出行路线
- **实时信息** — 天气、人流、节庆活动查询
- **文化导览** — 瑶族/客家/广府文化深度讲解
- **摄影攻略** — 推荐最佳拍摄地点和时间

请告诉我您的出行需求吧！比如：出行人数、天数、预算、兴趣偏好等。`;

const WELCOME_MESSAGE_EN = `Hello! I'm XiaoZhi, your Qingyuan AI Travel Assistant.

I can help you with:
- **Smart Trip Planning** — Personalized itineraries based on your time, budget & preferences
- **Village Recommendations** — RAI/CPI/VSI index-based recommendations
- **Route Planning** — Optimized travel routes
- **Real-time Info** — Weather, crowd levels, festival events
- **Cultural Guide** — Yao/Hakka/Cantonese culture deep dives
- **Photography Tips** — Best shooting locations & timing

Tell me your travel needs! e.g. group size, days, budget, interests.`;

async function fetchChatAPI(
  messages: { role: string; content: string }[],
  locale: string
): Promise<{ content: string; source: string }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, locale }),
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    return { content: data.content, source: data.source || "unknown" };
  } catch (err) {
    console.warn("[Planner] API call failed, using offline fallback", err);
    throw err;
  }
}

function PlannerContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const villageParam = searchParams.get("village");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const welcome: Message = {
      id: 1,
      role: "assistant",
      content: locale === "zh" ? WELCOME_MESSAGE : WELCOME_MESSAGE_EN,
      timestamp: new Date(),
    };
    setMessages([welcome]);

    if (villageParam) {
      const villageName: Record<string, string> = {
        fenglin: "峰林小镇",
        nangang: "南岗千年瑶寨",
        shangyue: "上岳古村",
        youling: "油岭瑶寨",
        jiqingli: "积庆里",
      };
      const name = villageName[villageParam] || villageParam;
      setTimeout(() => {
        handleSend(`帮我规划去${name}的行程`);
      }, 800);
    }
  }, [villageParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Build conversation history for API
    const chatHistory = [...messages, userMsg]
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    fetchChatAPI(chatHistory, locale)
      .then(({ content }) => {
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .catch(() => {
        // Offline fallback — still provide a useful response
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: locale === "zh"
            ? "抱歉，AI服务暂时不可用。请稍后重试，或点击下方前往 [村落页面](/villages) 获取信息。"
            : "Sorry, AI service is temporarily unavailable. Please try again later or visit our [Villages page](/villages).",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      })
      .finally(() => setIsTyping(false));
  };

  const handleReset = () => {
    initialized.current = false;
    setMessages([]);
    setTimeout(() => {
      initialized.current = true;
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: locale === "zh" ? WELCOME_MESSAGE : WELCOME_MESSAGE_EN,
        timestamp: new Date(),
      }]);
    }, 300);
  };

  return (
    <section className="flex-1 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden flex flex-col" style={{ height: "calc(100vh - 340px)", minHeight: "500px" }}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <Mountain className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">{locale === "zh" ? "小智 · AI旅行规划师" : "XiaoZhi · AI Trip Planner"}</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {locale === "zh" ? "在线" : "Online"}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {locale === "zh" ? "重新开始" : "Reset"}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-emerald-600 text-white rounded-tr-md"
                      : "bg-card border border-border rounded-tl-md"
                  }`}>
                    {msg.role === "assistant" ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    )}
                    <div className={`text-xs mt-2 ${msg.role === "user" ? "text-emerald-200" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString(locale === "zh" ? "zh-CN" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-sky-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span className="text-sm text-muted-foreground">{locale === "zh" ? "小智正在思考..." : "Thinking..."}</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-5 py-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">{locale === "zh" ? "快速开始" : "Quick Start"}</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(locale === "zh" ? prompt.text : prompt.textEn)}
                    className="text-left text-xs px-3 py-2 rounded-lg border border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                  >
                    <prompt.icon className="h-3.5 w-3.5 mr-1.5 text-emerald-600 shrink-0" />
                    {locale === "zh" ? prompt.text : prompt.textEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 py-3 border-t border-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={locale === "zh" ? "输入您的旅行需求，例如：3天2夜亲子游..." : "Describe your travel needs..."}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4"
                size="default"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {locale === "zh"
                ? "基于LangChain RAG + ReAct Agent · 三级降级容错 · 支持离线"
                : "Powered by LangChain RAG + ReAct Agent · 3-level fallback · Offline support"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PlannerPage() {
  const { t } = useI18n();

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={t("page.planner.title")}
        description={t("page.planner.desc")}
        gradient="from-sky-600 to-blue-500"
      />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>}>
        <PlannerContent />
      </Suspense>
      <Footer />
    </main>
  );
}
