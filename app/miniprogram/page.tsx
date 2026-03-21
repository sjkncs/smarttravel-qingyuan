"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, QrCode, MapPin, MessageCircle, Camera, Compass,
  Ticket, Star, Users, Zap, Shield, Globe, ChevronRight,
  Scan, Navigation, Heart, ShoppingBag, Bell, Home,
  Search, User, Map, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const miniProgramFeatures = [
  {
    icon: MapPin,
    title: "智能导览",
    titleEn: "Smart Guide",
    desc: "AR实景导航 + AI语音讲解，自动识别景点并推送文化故事",
    descEn: "AR navigation + AI voice guide, auto-detect spots with cultural stories",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    icon: Ticket,
    title: "一码通行",
    titleEn: "One-Code Pass",
    desc: "景区门票、民宿预订、体验活动一站式购买，扫码即入",
    descEn: "Tickets, homestay booking, activities in one place, scan to enter",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-900/30",
  },
  {
    icon: Camera,
    title: "AI旅拍",
    titleEn: "AI Photo",
    desc: "AI生成清远风格滤镜，一键生成旅行海报分享朋友圈",
    descEn: "AI Qingyuan-style filters, generate travel posters for sharing",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/30",
  },
  {
    icon: Compass,
    title: "村落发现",
    titleEn: "Village Discovery",
    desc: "基于位置的附近村落推荐，RAI可达性指数实时展示",
    descEn: "Location-based village recommendations with real-time RAI scores",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    icon: MessageCircle,
    title: "AI旅行助手",
    titleEn: "AI Travel Assistant",
    desc: "语音对话式行程规划，支持粤语、普通话、英语",
    descEn: "Voice-based trip planning in Cantonese, Mandarin, and English",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/30",
  },
  {
    icon: ShoppingBag,
    title: "特产商城",
    titleEn: "Local Products",
    desc: "清远特产直购，英德红茶、连州水晶梨、清远鸡产地直发",
    descEn: "Buy local products directly: Yingde tea, Lianzhou pear, Qingyuan chicken",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/30",
  },
];

const miniProgramScreens = [
  {
    id: "home",
    label: "首页",
    labelEn: "Home",
    icon: Home,
    content: {
      greeting: "你好，旅行者 👋",
      weather: "清远 · 晴 28°C",
      cards: [
        { title: "千年瑶寨", tag: "热门", distance: "2.5km" },
        { title: "英西峰林", tag: "推荐", distance: "15km" },
        { title: "积庆里茶园", tag: "新上", distance: "8km" },
      ],
      quickActions: ["扫码购票", "AI规划", "附近村落", "特产商城"],
    },
  },
  {
    id: "explore",
    label: "发现",
    labelEn: "Explore",
    icon: Compass,
    content: {
      search: "搜索村落、景点、活动...",
      categories: ["全部", "自然风光", "民族文化", "田园体验", "温泉养生"],
      villages: [
        { name: "峰林小镇", rating: 4.8, rai: 92 },
        { name: "上岳古村", rating: 4.6, rai: 88 },
        { name: "油岭瑶寨", rating: 4.7, rai: 85 },
      ],
    },
  },
  {
    id: "ai",
    label: "AI助手",
    labelEn: "AI",
    icon: Zap,
    content: {
      messages: [
        { role: "ai", text: "你好！我是智游清远AI助手，有什么可以帮你的？" },
        { role: "user", text: "推荐一个适合带小朋友去的村落" },
        { role: "ai", text: "推荐峰林小镇！VSI安全指数92分，有温泉亲子套餐，路况平坦适合婴儿车。距你当前位置约15分钟车程。" },
      ],
    },
  },
  {
    id: "profile",
    label: "我的",
    labelEn: "Profile",
    icon: User,
    content: {
      name: "旅行者小林",
      level: "Lv.5 探索达人",
      stats: [
        { label: "足迹", value: "12" },
        { label: "收藏", value: "28" },
        { label: "勋章", value: "6" },
      ],
      menu: ["我的订单", "我的行程", "旅行足迹", "优惠券", "设置"],
    },
  },
];

const techSpecs = [
  { label: "框架", labelEn: "Framework", value: "Taro 4 + React 18 跨端" },
  { label: "后端", labelEn: "Backend", value: "共享 Next.js API Routes" },
  { label: "地图", labelEn: "Map", value: "腾讯地图 SDK + 自研 POI" },
  { label: "AI", labelEn: "AI", value: "RAG 知识库 + 多模态大模型" },
  { label: "支付", labelEn: "Payment", value: "微信支付 + 支付宝小程序" },
  { label: "审核", labelEn: "Moderation", value: "五层 AI 过滤 + DeepSeek 语义" },
];

export default function MiniProgramPage() {
  const { locale } = useI18n();
  const [activeScreen, setActiveScreen] = useState("home");
  const currentScreen = miniProgramScreens.find((s) => s.id === activeScreen)!;

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={locale === "zh" ? "微信小程序" : "WeChat Mini Program"}
        description={locale === "zh" ? "随时随地，指尖上的清远乡村之旅" : "Qingyuan village travel at your fingertips"}
        gradient="from-green-500 to-emerald-500"
      />

      <section className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-16">

          {/* ── Section 1: 小程序预览 ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Phone Mockup */}
            <motion.div
              initial={{ x: -40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative w-[280px]">
                {/* Phone frame */}
                <div className="rounded-[2.5rem] border-[6px] border-gray-800 dark:border-gray-200 bg-card overflow-hidden shadow-2xl">
                  {/* Status bar */}
                  <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-[10px]">
                    <span>9:41</span>
                    <span className="font-medium">智游清远</span>
                    <span>···</span>
                  </div>

                  {/* Screen content */}
                  <div className="min-h-[480px] bg-gray-50 dark:bg-gray-900">
                    {activeScreen === "home" && (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">{currentScreen.content.greeting}</p>
                            <p className="text-[10px] text-muted-foreground">{currentScreen.content.weather}</p>
                          </div>
                          <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <Bell className="h-4 w-4 text-emerald-600" />
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {(currentScreen.content.quickActions as string[]).map((action) => (
                            <div key={action} className="text-center p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                              <div className="h-7 w-7 mx-auto mb-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                {action === "扫码购票" && <Scan className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "AI规划" && <Zap className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "附近村落" && <Navigation className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "特产商城" && <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />}
                              </div>
                              <span className="text-[9px]">{action}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold">附近推荐</span>
                            <span className="text-[10px] text-emerald-600">查看全部 →</span>
                          </div>
                          <div className="space-y-2">
                            {(currentScreen.content.cards as { title: string; tag: string; distance: string }[]).map((card) => (
                              <div key={card.title} className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                                <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                                  <MapPin className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold">{card.title}</span>
                                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{card.tag}</span>
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">距你 {card.distance}</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === "explore" && (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                          <Search className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">{(currentScreen.content as any).search}</span>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {((currentScreen.content as any).categories as string[]).map((cat, i) => (
                            <span key={cat} className={`text-[9px] px-2.5 py-1 rounded-full whitespace-nowrap ${i === 0 ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-800 shadow-sm"}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {((currentScreen.content as any).villages as { name: string; rating: number; rai: number }[]).map((v) => (
                            <div key={v.name} className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold">{v.name}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] font-medium">{v.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">RAI {v.rai}</span>
                                <span className="text-[9px] text-muted-foreground">可达性指数</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeScreen === "ai" && (
                      <div className="p-4 space-y-2 flex flex-col min-h-[400px]">
                        <div className="flex-1 space-y-2">
                          {((currentScreen.content as any).messages as { role: string; text: string }[]).map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[10px] leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-emerald-600 text-white rounded-br-sm"
                                  : "bg-white dark:bg-gray-800 shadow-sm rounded-bl-sm"
                              }`}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                          <span className="flex-1 text-[10px] text-muted-foreground">输入消息...</span>
                          <div className="h-6 w-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeScreen === "profile" && (
                      <div className="p-4 space-y-3">
                        <div className="text-center py-4">
                          <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                            <User className="h-8 w-8 text-emerald-600" />
                          </div>
                          <p className="text-sm font-bold">{(currentScreen.content as any).name}</p>
                          <p className="text-[10px] text-emerald-600">{(currentScreen.content as any).level}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {((currentScreen.content as any).stats as { label: string; value: string }[]).map((stat) => (
                            <div key={stat.label} className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                              <div className="text-sm font-bold">{stat.value}</div>
                              <div className="text-[9px] text-muted-foreground">{stat.label}</div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          {((currentScreen.content as any).menu as string[]).map((item) => (
                            <div key={item} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-xs">
                              <span>{item}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tab bar */}
                  <div className="bg-white dark:bg-gray-800 border-t border-border flex items-center justify-around py-2 px-1">
                    {miniProgramScreens.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveScreen(s.id)}
                        className={`flex flex-col items-center gap-0.5 px-2 ${activeScreen === s.id ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        <s.icon className="h-4 w-4" />
                        <span className="text-[8px]">{locale === "zh" ? s.label : s.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-800 dark:bg-gray-200 rounded-b-xl" />
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-green-500 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{locale === "zh" ? "智游清远小程序" : "SmartTravel Mini Program"}</h2>
                    <p className="text-xs text-muted-foreground">{locale === "zh" ? "微信搜索「智游清远」即可使用" : "Search 'SmartTravel Qingyuan' on WeChat"}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {locale === "zh"
                    ? "无需下载APP，微信扫码即开即用。集智能导览、门票预订、AI行程规划、特产商城于一体，打造轻量化的清远乡村旅行超级入口。支持离线地图和弱网模式，深山村落也能流畅使用。"
                    : "No app download needed. Scan to use instantly on WeChat. An all-in-one lightweight entry for Qingyuan village travel with smart guide, booking, AI planning, and local products. Supports offline maps and weak-network mode."}
                </p>
              </div>

              {/* QR Code placeholder */}
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card/60">
                <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center border border-border shrink-0">
                  <QrCode className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">{locale === "zh" ? "扫码体验小程序" : "Scan to Try"}</p>
                  <p className="text-xs text-muted-foreground">
                    {locale === "zh" ? "微信扫描二维码，或搜索「智游清远」小程序" : "Scan with WeChat or search 'SmartTravel Qingyuan'"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-600">
                    <Shield className="h-3 w-3" />
                    {locale === "zh" ? "已通过微信安全认证" : "WeChat Security Certified"}
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "50万+", valueEn: "500K+", label: "累计用户", labelEn: "Users" },
                  { value: "4.9", valueEn: "4.9", label: "用户评分", labelEn: "Rating" },
                  { value: "<2s", valueEn: "<2s", label: "启动速度", labelEn: "Launch" },
                ].map((m) => (
                  <div key={m.label} className="text-center p-3 rounded-xl border border-border bg-card/60">
                    <div className="text-xl font-bold text-emerald-600">{locale === "zh" ? m.value : m.valueEn}</div>
                    <div className="text-[10px] text-muted-foreground">{locale === "zh" ? m.label : m.labelEn}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Section 2: 核心功能 ── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {locale === "zh" ? "核心功能" : "Core Features"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "六大模块，覆盖旅行全链路" : "Six modules covering the entire travel journey"}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {miniProgramFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-border bg-card/60 p-5 hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${feature.bg}`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{locale === "zh" ? feature.title : feature.titleEn}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{locale === "zh" ? feature.desc : feature.descEn}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Section 3: 技术架构 ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card/60 p-6 md:p-8"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              {locale === "zh" ? "技术架构" : "Tech Architecture"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {techSpecs.map((spec) => (
                <div key={spec.label} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                  <div className="text-[10px] text-muted-foreground mb-0.5">{locale === "zh" ? spec.label : spec.labelEn}</div>
                  <div className="text-xs font-bold">{spec.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                {locale === "zh" ? "内容安全" : "Content Safety"}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "zh"
                  ? "小程序集成五层AI内容审核过滤系统：关键词过滤 → 正则模式匹配 → 民族文化敏感检测 → 垃圾特征分析 → DeepSeek AI 语义深度分析。所有用户生成内容（UGC）在发布前均经过实时AI审核，确保社区内容安全合规，尊重瑶族、壮族等少数民族文化。"
                  : "Mini program integrates a 5-layer AI content moderation system: keyword filtering → pattern matching → ethnic sensitivity detection → spam analysis → DeepSeek AI semantic analysis. All UGC is reviewed by AI in real-time before publishing."}
              </p>
              <Button variant="outline" size="sm" className="mt-3 text-xs" asChild>
                <Link href="/enterprise/moderation">
                  {locale === "zh" ? "查看审核控制台" : "View Moderation Console"}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ── Section 4: CTA ── */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 p-8 md:p-10 text-center text-white"
          >
            <Smartphone className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">
              {locale === "zh" ? "开始你的清远之旅" : "Start Your Qingyuan Journey"}
            </h2>
            <p className="text-sm opacity-80 max-w-md mx-auto mb-6">
              {locale === "zh"
                ? "打开微信，搜索「智游清远」小程序，即刻体验AI驱动的乡村旅行新方式"
                : "Open WeChat, search 'SmartTravel Qingyuan' mini program, experience AI-powered rural travel"}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-white/90 font-bold">
                <QrCode className="h-4 w-4 mr-2" />
                {locale === "zh" ? "扫码体验" : "Scan to Try"}
              </Button>
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10" asChild>
                <Link href="/guide">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {locale === "zh" ? "使用指南" : "User Guide"}
                </Link>
              </Button>
            </div>
          </motion.div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
