"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone, QrCode, MapPin, MessageCircle, Compass,
  Star, Users, Zap, Shield, Globe, ChevronRight, ChevronDown,
  Navigation, ShoppingBag, Bell, Home, Check, ArrowRight,
  Search, User, Map, BookOpen, MessageSquare, Headphones,
  CalendarDays, ThumbsUp, Eye, Layers, Lock, Wifi, WifiOff,
  BarChart3, TrendingUp, Clock, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const miniProgramFeatures = [
  {
    icon: Compass,
    title: "村落发现",
    titleEn: "Village Discovery",
    desc: "基于位置的附近村落推荐，RAI/CPI/VSI三维评分实时展示",
    descEn: "Location-based village recommendations with real-time RAI/CPI/VSI scores",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    icon: MessageCircle,
    title: "AI旅行助手",
    titleEn: "AI Travel Assistant",
    desc: "对话式智能问答，推荐村落、规划路线、解答旅行问题",
    descEn: "Conversational AI for village recommendations, route planning, and travel Q&A",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-900/30",
  },
  {
    icon: CalendarDays,
    title: "AI行程规划",
    titleEn: "AI Trip Planner",
    desc: "输入天数、人数、偏好，AI自动生成专属清远旅行行程",
    descEn: "Enter days, travelers, preferences — AI generates a custom Qingyuan itinerary",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/30",
  },
  {
    icon: ShoppingBag,
    title: "特产商城",
    titleEn: "Local Products",
    desc: "清远特产直购，英德红茶、连州水晶梨、瑶族手工艺品产地直发",
    descEn: "Buy local products: Yingde tea, Lianzhou pear, Yao handicrafts — direct from source",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/30",
  },
  {
    icon: MessageSquare,
    title: "社区论坛",
    titleEn: "Community Forum",
    desc: "旅行攻略分享、村落点评、美食推荐，AI智能审核保障社区安全",
    descEn: "Share travel tips, village reviews, food guides — AI-moderated for safety",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/30",
  },
  {
    icon: Map,
    title: "地图导航",
    titleEn: "Map Navigation",
    desc: "清远村落分布地图，一键导航到目的地，支持腾讯地图SDK",
    descEn: "Village distribution map with one-tap navigation via Tencent Maps SDK",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    icon: Headphones,
    title: "在线客服",
    titleEn: "Online Support",
    desc: "AI智能客服7×24在线，复杂问题自动转接人工，满意度评价",
    descEn: "AI support 24/7, auto-escalation to human agents, satisfaction ratings",
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/30",
  },
  {
    icon: MapPin,
    title: "村落详情",
    titleEn: "Village Details",
    desc: "高清实景图片、RAI评分、推荐活动、交通指南、温馨提示一应俱全",
    descEn: "HD photos, RAI scores, activities, transport guide, and tips — all in one place",
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-900/30",
  },
];

const miniProgramScreens = [
  {
    id: "home",
    label: "首页",
    labelEn: "Home",
    icon: Home,
    content: {
      greeting: "你好，旅行者",
      weather: "清远 · 晴 28°C",
      cards: [
        { title: "千年瑶寨", tag: "热门", distance: "2.5km" },
        { title: "英西峰林", tag: "推荐", distance: "15km" },
        { title: "积庆里茶园", tag: "新上", distance: "8km" },
      ],
      quickActions: ["AI规划", "附近村落", "地图导航", "特产商城", "行程规划", "在线客服"],
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
        { role: "ai", text: "你好！我是智游清远AI助手，我可以帮你推荐村落、规划行程、解答旅行问题、介绍瑶族/壮族文化。" },
        { role: "user", text: "推荐一个适合带小朋友去的村落" },
        { role: "ai", text: "推荐峰林小镇！VSI安全指数92分，有温泉亲子套餐，路况平坦适合婴儿车。距你当前位置约15分钟车程。" },
      ],
    },
  },
  {
    id: "forum",
    label: "社区",
    labelEn: "Forum",
    icon: MessageSquare,
    content: {
      categories: ["全部", "攻略", "美食", "求助", "活动"],
      posts: [
        { title: "英西峰林徒步攻略", author: "山野旅人", votes: 128, views: 2340, comments: 36, type: "攻略" },
        { title: "南岗瑶寨美食地图", author: "美食探家", votes: 95, views: 1820, comments: 22, type: "美食" },
        { title: "清远温泉度假体验分享", author: "泡泡鱼", votes: 76, views: 1560, comments: 18, type: "攻略" },
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
      menu: ["我的订单", "我的行程", "地图导航", "我的收藏", "在线客服", "我的帖子", "设置"],
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

const userJourneySteps = [
  { icon: QrCode, title: "扫码进入", titleEn: "Scan & Enter", desc: "微信扫码即开即用，无需下载", descEn: "Scan with WeChat, no download needed" },
  { icon: Compass, title: "发现村落", titleEn: "Discover Villages", desc: "浏览RAI/CPI/VSI评分，选择目的地", descEn: "Browse RAI/CPI/VSI scores, pick destination" },
  { icon: CalendarDays, title: "AI规划行程", titleEn: "AI Plan Trip", desc: "输入偏好，AI生成专属行程", descEn: "Input preferences, AI generates itinerary" },
  { icon: Map, title: "导航出发", titleEn: "Navigate & Go", desc: "一键导航，实时路线指引", descEn: "One-tap navigation with real-time routing" },
  { icon: MessageSquare, title: "分享体验", titleEn: "Share Experience", desc: "在社区论坛发布攻略和点评", descEn: "Post guides and reviews in community forum" },
];

const advantages = [
  { icon: Zap, title: "即开即用", titleEn: "Instant Access", desc: "无需下载安装，微信扫码秒开，首屏加载 < 1.5s", descEn: "No download needed, scan to open in < 1.5s" },
  { icon: Layers, title: "轻量高效", titleEn: "Lightweight", desc: "包体仅 2MB，运行内存占用极低，低端机流畅运行", descEn: "Only 2MB package, smooth on low-end devices" },
  { icon: WifiOff, title: "弱网可用", titleEn: "Offline Ready", desc: "核心数据本地缓存，深山无信号区域仍可查看已加载内容", descEn: "Core data cached locally, works in no-signal areas" },
  { icon: Shield, title: "隐私安全", titleEn: "Privacy Safe", desc: "遵循微信隐私协议，敏感数据端侧加密，不滥用权限", descEn: "WeChat privacy compliant, on-device encryption" },
  { icon: Globe, title: "跨端一致", titleEn: "Cross-Platform", desc: "Taro框架编译，微信/支付宝/H5 多端一致体验", descEn: "Taro compiled for WeChat, Alipay, H5 consistency" },
  { icon: TrendingUp, title: "持续进化", titleEn: "Continuous Updates", desc: "OTA静默更新，新功能无感上线，无需用户手动操作", descEn: "OTA silent updates, new features deploy seamlessly" },
];

const performanceMetrics = [
  { value: "1.2s", label: "冷启动", labelEn: "Cold Start" },
  { value: "98.5%", label: "接口成功率", labelEn: "API Success" },
  { value: "< 50MB", label: "运行内存", labelEn: "Runtime RAM" },
  { value: "2MB", label: "包体大小", labelEn: "Package Size" },
  { value: "60fps", label: "滑动帧率", labelEn: "Scroll FPS" },
  { value: "99.9%", label: "可用性", labelEn: "Uptime" },
];

const testimonials = [
  { name: "小红", role: "亲子游用户", roleEn: "Family Traveler", text: "带孩子去峰林小镇，AI推荐的路线特别贴心，连婴儿车停放点都标注了！VSI安全指数让我很放心。", textEn: "AI route was so thoughtful for family trips, even marked stroller parking spots!" },
  { name: "阿杰", role: "摄影爱好者", roleEn: "Photography Fan", text: "发现页的RAI评分帮我找到了好多小众村落，连南瑶寨的日出太震撼了，社区里分享了攻略获得200+点赞。", textEn: "RAI scores helped me find hidden gems. The sunrise at Liannan Yao village was stunning!" },
  { name: "Linda", role: "外国游客", roleEn: "Foreign Tourist", text: "The AI assistant speaks English and helped me plan a 3-day cultural trip. The offline map feature saved me when I had no signal in the mountains.", textEn: "AI assistant helped me plan a 3-day cultural trip. Offline maps saved me in the mountains." },
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
                  <div className="h-[480px] overflow-y-auto bg-gray-50 dark:bg-gray-900">
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

                        <div className="grid grid-cols-3 gap-2">
                          {(currentScreen.content.quickActions as string[]).map((action) => (
                            <div key={action} className="text-center p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                              <div className="h-7 w-7 mx-auto mb-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                {action === "AI规划" && <Zap className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "附近村落" && <Navigation className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "地图导航" && <Map className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "特产商城" && <ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "行程规划" && <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />}
                                {action === "在线客服" && <Headphones className="h-3.5 w-3.5 text-emerald-600" />}
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
                      <div className="p-4 space-y-2 flex flex-col h-full">
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

                    {activeScreen === "forum" && (
                      <div className="p-4 space-y-3">
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {((currentScreen.content as any).categories as string[]).map((cat: string, i: number) => (
                            <span key={cat} className={`text-[9px] px-2.5 py-1 rounded-full whitespace-nowrap ${i === 0 ? "bg-emerald-600 text-white" : "bg-white dark:bg-gray-800 shadow-sm"}`}>
                              {cat}
                            </span>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {((currentScreen.content as any).posts as { title: string; author: string; votes: number; views: number; comments: number; type: string }[]).map((post) => (
                            <div key={post.title} className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{post.type}</span>
                                <span className="text-xs font-bold flex-1 truncate">{post.title}</span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[9px] text-muted-foreground">{post.author}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
                                <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" /> {post.votes}</span>
                                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {post.views}</span>
                                <span className="flex items-center gap-0.5"><MessageSquare className="h-2.5 w-2.5" /> {post.comments}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-1 p-2 rounded-xl bg-emerald-600 text-white">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-medium">发布帖子</span>
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
                    ? "无需下载APP，微信扫码即开即用。集村落发现、AI智能助手、行程规划、特产商城、社区论坛、地图导航、在线客服于一体，打造轻量化的清远乡村旅行超级入口。"
                    : "No app download needed. Scan to use instantly on WeChat. An all-in-one entry for Qingyuan village travel with AI assistant, trip planner, local products, community forum, map navigation, and online support."}
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

          {/* ── Section 2: 用户旅程 ── */}
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">{locale === "zh" ? "5步开启清远之旅" : "5 Steps to Start"}</h2>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "从扫码到分享，全链路智能体验" : "From scanning to sharing, fully intelligent"}</p>
            </div>
            <div className="relative">
              <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-800 dark:via-emerald-600 dark:to-emerald-800" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {userJourneySteps.map((step, i) => (
                  <motion.div key={step.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3 shadow-sm">
                      <step.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 mb-1">STEP {i + 1}</span>
                    <h3 className="text-sm font-bold mb-1">{locale === "zh" ? step.title : step.titleEn}</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{locale === "zh" ? step.desc : step.descEn}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Section 3: 核心功能 ── */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{locale === "zh" ? "八大核心功能" : "8 Core Features"}</h2>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "覆盖旅行全链路，打造一站式智慧出行" : "End-to-end travel modules for a one-stop smart journey"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {miniProgramFeatures.map((feature, i) => (
                <motion.div key={feature.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group rounded-2xl border border-border bg-card/60 p-5 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${feature.bg} group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{locale === "zh" ? feature.title : feature.titleEn}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{locale === "zh" ? feature.desc : feature.descEn}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Section 4: 为什么选择小程序 ── */}
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{locale === "zh" ? "为什么选择小程序" : "Why Mini Program?"}</h2>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "对比传统APP，小程序的六大优势" : "Six advantages over traditional apps"}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advantages.map((adv, i) => (
                <motion.div key={adv.title} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex gap-4 p-5 rounded-2xl border border-border bg-card/60 hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                    <adv.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-1">{locale === "zh" ? adv.title : adv.titleEn}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{locale === "zh" ? adv.desc : adv.descEn}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Section 5: 性能指标 ── */}
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{locale === "zh" ? "性能指标" : "Performance Metrics"}</h2>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "极致优化，流畅体验" : "Optimized for the smoothest experience"}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {performanceMetrics.map((m, i) => (
                <motion.div key={m.label} initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="text-center p-5 rounded-2xl border border-border bg-card/60">
                  <div className="text-2xl font-bold text-emerald-600 mb-1">{m.value}</div>
                  <div className="text-xs text-muted-foreground">{locale === "zh" ? m.label : m.labelEn}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Section 6: 技术架构 ── */}
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
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
                {locale === "zh" ? "五层AI内容安全" : "5-Layer AI Content Safety"}
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { zh: "关键词过滤", en: "Keyword Filter" },
                  { zh: "正则匹配", en: "Pattern Match" },
                  { zh: "民族文化敏感检测", en: "Cultural Sensitivity" },
                  { zh: "垃圾特征分析", en: "Spam Analysis" },
                  { zh: "DeepSeek 语义分析", en: "DeepSeek Semantic AI" },
                ].map((layer, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-3 w-3" /> {locale === "zh" ? layer.zh : layer.en}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === "zh"
                  ? "所有UGC在发布前经实时AI审核，确保社区安全合规，尊重瑶族、壮族等少数民族文化。"
                  : "All UGC reviewed by AI in real-time before publishing, respecting ethnic minority cultures."}
              </p>
              <Button variant="outline" size="sm" className="mt-3 text-xs" asChild>
                <Link href="/enterprise/moderation">
                  {locale === "zh" ? "查看审核控制台" : "View Moderation Console"}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* ── Section 7: 用户评价 ── */}
          <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">{locale === "zh" ? "用户怎么说" : "What Users Say"}</h2>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "来自真实旅行者的声音" : "Voices from real travelers"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t, i) => (
                <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-5 rounded-2xl border border-border bg-card/60">
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{locale === "zh" ? t.text : t.textEn}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground">{locale === "zh" ? t.role : t.roleEn}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
