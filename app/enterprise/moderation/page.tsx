"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX, Eye, Search,
  AlertTriangle, CheckCircle2, XCircle, Clock, BarChart3,
  Filter, RefreshCw, MessageSquare, ChevronDown, Ban, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

type ModerationStatus = "pending" | "approved" | "rejected";
type FlagType = "spam" | "profanity" | "violence" | "pornography" | "discrimination" | "ethnic_sensitivity" | "privacy_leak" | "advertising" | "contact_info";

interface ModerationItem {
  id: string;
  title: string;
  content: string;
  author: string;
  time: string;
  score: number;
  status: ModerationStatus;
  flags: { type: FlagType; severity: "low" | "medium" | "high"; detail: string }[];
  type: "post" | "comment";
}

const mockItems: ModerationItem[] = [
  {
    id: "m1",
    title: "【急】千年瑶寨门票免费领取！加微信领取优惠",
    content: "限时活动！千年瑶寨门票0元领取，加微信赚钱 wxid_abc123，月入过万不是梦！点击链接 http://spam.example.com 立即参与！",
    author: "营销号001",
    time: "10分钟前",
    score: 15,
    status: "rejected",
    flags: [
      { type: "advertising", severity: "medium", detail: "含有广告推销词汇：加微信赚钱、月入过万" },
      { type: "spam", severity: "medium", detail: "内容过短且包含外部链接" },
      { type: "contact_info", severity: "low", detail: "检测到微信号" },
    ],
    type: "post",
  },
  {
    id: "m2",
    title: "瑶族文化体验——那些未开化的原始部落",
    content: "去了连南的瑶寨，感觉他们还是很落后的，那些迷信活动真的让人无语，像是看野人一样...",
    author: "游客小王",
    time: "1小时前",
    score: 35,
    status: "rejected",
    flags: [
      { type: "ethnic_sensitivity", severity: "high", detail: "含有对少数民族的歧视性表述，请尊重瑶族、壮族等民族文化" },
      { type: "discrimination", severity: "high", detail: "使用了贬低少数民族的词汇" },
    ],
    type: "post",
  },
  {
    id: "m3",
    title: "英西峰林自驾路线分享，附我的手机号方便联系",
    content: "这次自驾英西峰林走廊非常棒！路线分享给大家。有问题可以打我电话13812345678。沿途风景优美，推荐大家国庆去。",
    author: "自驾老司机",
    time: "3小时前",
    score: 72,
    status: "pending",
    flags: [
      { type: "contact_info", severity: "low", detail: "检测到手机号码，请注意隐私保护" },
    ],
    type: "post",
  },
  {
    id: "m4",
    title: "积庆里茶园采茶攻略",
    content: "周末去了积庆里采茶，环境很好，制茶师傅很专业。推荐大家工作日去，人少体验更好。茶叶品质不错，英德红茶值得品尝。",
    author: "茶香小筑",
    time: "5小时前",
    score: 95,
    status: "approved",
    flags: [],
    type: "post",
  },
  {
    id: "m5",
    title: "求助：峰林小镇住宿推荐",
    content: "计划带家人去峰林小镇，求推荐干净舒适的民宿！预算300-500一晚，最好有温泉。",
    author: "度假达人",
    time: "6小时前",
    score: 98,
    status: "approved",
    flags: [],
    type: "post",
  },
  {
    id: "m6",
    title: "",
    content: "这个攻略写得太傻逼了，完全是骗人的垃圾信息，楼主脑残吧",
    author: "匿名喷子",
    time: "2小时前",
    score: 40,
    status: "rejected",
    flags: [
      { type: "profanity", severity: "medium", detail: "内容包含违禁词：傻逼" },
      { type: "profanity", severity: "medium", detail: "内容包含违禁词：脑残" },
    ],
    type: "comment",
  },
  {
    id: "m7",
    title: "上岳古村摄影打卡点推荐",
    content: "上岳古村的锅耳墙太适合拍照了！！！推荐几个机位：村口大榕树、古井旁、锅耳墙巷子。光线最好的时间是下午4-5点。不过注意有些老宅是私人住宅，拍照前要打招呼。",
    author: "摄影师阿杰",
    time: "8小时前",
    score: 88,
    status: "approved",
    flags: [],
    type: "post",
  },
];

const statsCards = [
  { label: "今日审核", labelEn: "Today", value: "156", icon: Eye, color: "text-sky-600", bg: "bg-sky-50 dark:bg-sky-900/30" },
  { label: "自动通过", labelEn: "Auto Pass", value: "128", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "待人工审核", labelEn: "Pending", value: "12", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "已拦截", labelEn: "Blocked", value: "16", icon: ShieldX, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/30" },
];

const flagTypeLabels: Record<string, { zh: string; en: string; color: string }> = {
  spam: { zh: "垃圾信息", en: "Spam", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300" },
  profanity: { zh: "不文明用语", en: "Profanity", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
  violence: { zh: "暴力内容", en: "Violence", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  pornography: { zh: "色情内容", en: "Pornography", color: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" },
  discrimination: { zh: "歧视言论", en: "Discrimination", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  ethnic_sensitivity: { zh: "民族文化敏感", en: "Ethnic Sensitivity", color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  privacy_leak: { zh: "隐私泄露", en: "Privacy Leak", color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" },
  advertising: { zh: "广告推销", en: "Advertising", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  contact_info: { zh: "联系方式", en: "Contact Info", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
};

export default function ModerationPage() {
  const { locale } = useI18n();
  const [items, setItems] = useState(mockItems);
  const [filterStatus, setFilterStatus] = useState<"all" | ModerationStatus>("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = items.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchSearch = searchQuery === "" ||
      item.title.includes(searchQuery) ||
      item.content.includes(searchQuery) ||
      item.author.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const handleApprove = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "approved" as const } : item));
  };
  const handleReject = (id: string) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, status: "rejected" as const } : item));
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };
  const scoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
    if (score >= 50) return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  };
  const statusIcon = (status: ModerationStatus) => {
    if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-amber-500" />;
  };
  const statusLabel = (status: ModerationStatus) => {
    const map = { pending: "待审核", approved: "已通过", rejected: "已拦截" };
    const mapEn = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
    return locale === "zh" ? map[status] : mapEn[status];
  };

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              {locale === "zh" ? "AI 内容审核控制台" : "AI Content Moderation Console"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === "zh" ? "多层智能过滤 · 民族文化敏感检测 · 实时拦截" : "Multi-layer Smart Filtering · Ethnic Sensitivity Detection · Real-time Blocking"}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? s.label : s.labelEn}</span>
                  <div className={`p-1.5 rounded-lg ${s.bg}`}>
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter Pipeline Visualization */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <Filter className="h-4 w-4 text-violet-500" />
              {locale === "zh" ? "AI 五层审核过滤流水线" : "AI 5-Layer Moderation Pipeline"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { step: 1, name: "关键词过滤", nameEn: "Keyword Filter", desc: "违禁词黑名单匹配", descEn: "Blocked word matching", icon: Ban, color: "text-red-500", blocked: "8" },
                { step: 2, name: "正则模式匹配", nameEn: "Pattern Matching", desc: "手机号/身份证/链接检测", descEn: "Phone/ID/URL detection", icon: Search, color: "text-amber-500", blocked: "5" },
                { step: 3, name: "民族文化敏感检测", nameEn: "Ethnic Sensitivity", desc: "瑶族/壮族文化保护", descEn: "Yao/Zhuang culture protection", icon: Shield, color: "text-violet-500", blocked: "2" },
                { step: 4, name: "垃圾特征分析", nameEn: "Spam Analysis", desc: "emoji轰炸/重复内容/短文本链接", descEn: "Emoji flood/repetition/short+link", icon: AlertTriangle, color: "text-sky-500", blocked: "1" },
                { step: 5, name: "DeepSeek AI 语义", nameEn: "DeepSeek AI", desc: "大模型深度语义分析·上下文理解", descEn: "LLM semantic analysis·context understanding", icon: Brain, color: "text-emerald-500", blocked: "3" },
              ].map((layer, i) => (
                <motion.div
                  key={layer.step}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="relative rounded-xl border border-border p-4 bg-muted/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground">L{layer.step}</span>
                    <layer.icon className={`h-4 w-4 ${layer.color}`} />
                  </div>
                  <h4 className="text-xs font-bold mb-1">{locale === "zh" ? layer.name : layer.nameEn}</h4>
                  <p className="text-[10px] text-muted-foreground mb-2">{locale === "zh" ? layer.desc : layer.descEn}</p>
                  <div className="text-[10px] text-red-500 font-medium">
                    {locale === "zh" ? `今日拦截 ${layer.blocked} 条` : `${layer.blocked} blocked today`}
                  </div>
                  {i < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground z-10">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "zh" ? "搜索内容或作者..." : "Search content or author..."}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
              {([
                { id: "all" as const, label: "全部", labelEn: "All" },
                { id: "pending" as const, label: "待审核", labelEn: "Pending" },
                { id: "approved" as const, label: "已通过", labelEn: "Approved" },
                { id: "rejected" as const, label: "已拦截", labelEn: "Rejected" },
              ]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === f.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  {locale === "zh" ? f.label : f.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`rounded-xl border bg-card overflow-hidden ${
                    item.status === "rejected" ? "border-red-200 dark:border-red-800" :
                    item.status === "pending" ? "border-amber-200 dark:border-amber-800" :
                    "border-border"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {statusIcon(item.status)}
                          <span className="text-[10px] font-medium text-muted-foreground">{statusLabel(item.status)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {item.type === "post" ? (locale === "zh" ? "帖子" : "Post") : (locale === "zh" ? "评论" : "Comment")}
                          </span>
                          {item.flags.map((f, i) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${flagTypeLabels[f.type]?.color || "bg-muted"}`}>
                              {locale === "zh" ? flagTypeLabels[f.type]?.zh : flagTypeLabels[f.type]?.en}
                            </span>
                          ))}
                        </div>
                        {item.title && (
                          <h4 className="text-sm font-bold mb-1 truncate">{item.title}</h4>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
                      </div>
                      <div className={`shrink-0 text-center px-3 py-2 rounded-lg border ${scoreBg(item.score)}`}>
                        <div className={`text-lg font-bold ${scoreColor(item.score)}`}>{item.score}</div>
                        <div className="text-[9px] text-muted-foreground">{locale === "zh" ? "安全分" : "Score"}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{locale === "zh" ? "作者" : "Author"}: <strong className="text-foreground">{item.author}</strong></span>
                        <span>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                          className="text-[10px] flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          {locale === "zh" ? "详情" : "Detail"}
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedItem === item.id ? "rotate-180" : ""}`} />
                        </button>
                        {item.status === "pending" && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] text-emerald-600 border-emerald-300 hover:bg-emerald-50" onClick={() => handleApprove(item.id)}>
                              <CheckCircle2 className="h-3 w-3 mr-1" />{locale === "zh" ? "通过" : "Approve"}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] text-red-600 border-red-300 hover:bg-red-50" onClick={() => handleReject(item.id)}>
                              <XCircle className="h-3 w-3 mr-1" />{locale === "zh" ? "拦截" : "Reject"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  <AnimatePresence>
                    {expandedItem === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                          <div>
                            <span className="text-[10px] font-bold text-muted-foreground mb-1 block">
                              {locale === "zh" ? "完整内容" : "Full Content"}
                            </span>
                            <p className="text-xs text-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-wrap">{item.content}</p>
                          </div>
                          {item.flags.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-muted-foreground mb-1 block">
                                {locale === "zh" ? "审核标记详情" : "Moderation Flags"}
                              </span>
                              <div className="space-y-1.5">
                                {item.flags.map((flag, i) => (
                                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                                    flag.severity === "high" ? "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300" :
                                    flag.severity === "medium" ? "bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300" :
                                    "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300"
                                  }`}>
                                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-bold">
                                        [{flag.severity === "high" ? (locale === "zh" ? "高危" : "HIGH") : flag.severity === "medium" ? (locale === "zh" ? "中危" : "MED") : (locale === "zh" ? "低危" : "LOW")}]
                                      </span>
                                      {" "}{flag.detail}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {locale === "zh" ? "暂无匹配的审核记录" : "No matching moderation records"}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
