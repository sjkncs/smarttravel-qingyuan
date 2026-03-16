"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, AlertTriangle, Star, MessageSquare, FileText,
  CheckCircle2, XCircle, Clock, TrendingUp, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const complianceChecks = [
  { scenic: "峰林小镇", license: true, pricing: true, safety: true, environment: true, service: true, score: 96 },
  { scenic: "千年瑶寨", license: true, pricing: true, safety: true, environment: true, service: false, score: 88 },
  { scenic: "上岳古村", license: true, pricing: true, safety: false, environment: true, service: true, score: 82 },
  { scenic: "油岭瑶寨", license: true, pricing: false, safety: true, environment: true, service: true, score: 78 },
  { scenic: "积庆里", license: true, pricing: true, safety: true, environment: true, service: true, score: 94 },
];

const complaints = [
  { id: "CP-240314-001", scenic: "千年瑶寨", type: "服务态度", content: "导游讲解敷衍，对瑶族文化介绍不够专业", sentiment: -0.6, status: "处理中", priority: "中" },
  { id: "CP-240313-002", scenic: "油岭瑶寨", type: "价格问题", content: "景区内小卖部水价比外面贵3倍，疑似价格欺诈", sentiment: -0.8, status: "已转执法", priority: "高" },
  { id: "CP-240312-003", scenic: "峰林小镇", type: "设施问题", content: "栈道部分木板松动，存在安全隐患", sentiment: -0.5, status: "已整改", priority: "高" },
  { id: "CP-240311-004", scenic: "上岳古村", type: "卫生问题", content: "公共厕所清洁不及时", sentiment: -0.4, status: "已整改", priority: "低" },
];

const serviceRatings = [
  { scenic: "峰林小镇", overall: 4.7, guide: 4.8, facility: 4.5, food: 4.6, transport: 4.3, reviews: 3245 },
  { scenic: "千年瑶寨", overall: 4.5, guide: 4.3, facility: 4.4, food: 4.6, transport: 3.8, reviews: 2156 },
  { scenic: "上岳古村", overall: 4.4, guide: 4.6, facility: 4.1, food: 4.3, transport: 4.0, reviews: 1432 },
  { scenic: "油岭瑶寨", overall: 4.2, guide: 4.5, facility: 3.9, food: 4.4, transport: 3.5, reviews: 987 },
  { scenic: "积庆里", overall: 4.6, guide: 4.7, facility: 4.5, food: 4.8, transport: 4.2, reviews: 1678 },
];

export default function SupervisionPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"compliance" | "complaints" | "ratings">("compliance");

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Eye className="h-5 w-5 text-sky-600" />
              {locale === "zh" ? "智慧监管与执法平台" : "Smart Supervision & Enforcement"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "合规监测 · NLP投诉分析 · 服务评级 · 执法闭环" : "Compliance · NLP Complaints · Service Rating · Enforcement"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/government">{locale === "zh" ? "返回政府版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, label: "合规达标率", labelEn: "Compliance Rate", value: "92%", color: "text-emerald-600" },
              { icon: MessageSquare, label: "待处理投诉", labelEn: "Pending Complaints", value: "1件", color: "text-amber-600" },
              { icon: Star, label: "平均服务评分", labelEn: "Avg Service Score", value: "4.48", color: "text-violet-600" },
              { icon: FileText, label: "年度报告", labelEn: "Annual Report", value: "生成中", color: "text-sky-600" },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? k.label : k.labelEn}</span>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <div className="text-2xl font-bold">{k.value}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            {([
              { id: "compliance" as const, label: "合规监测", labelEn: "Compliance", icon: CheckCircle2 },
              { id: "complaints" as const, label: "投诉分析", labelEn: "Complaints", icon: MessageSquare },
              { id: "ratings" as const, label: "服务评级", labelEn: "Ratings", icon: Star },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {tab === "compliance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "景区" : "Scenic"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "经营许可" : "License"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "价格合规" : "Pricing"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "安全达标" : "Safety"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "环保合规" : "Environ"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "服务标准" : "Service"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "综合评分" : "Score"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceChecks.map((c) => (
                      <tr key={c.scenic} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{c.scenic}</td>
                        {[c.license, c.pricing, c.safety, c.environment, c.service].map((v, i) => (
                          <td key={i} className="py-2.5 text-center">
                            {v ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" /> : <XCircle className="h-4 w-4 text-red-400 mx-auto" />}
                          </td>
                        ))}
                        <td className="py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.score >= 90 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : c.score >= 80 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>{c.score}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "complaints" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className={`p-4 rounded-xl border ${c.status === "处理中" ? "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/5" : c.status === "已转执法" ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/5" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">{c.id}</span>
                        <span className="text-sm font-bold">{c.scenic}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{c.type}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.priority === "高" ? "bg-red-100 dark:bg-red-900/20 text-red-600" : c.priority === "中" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-sky-100 dark:bg-sky-900/20 text-sky-600"}`}>{c.priority}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.status === "已整改" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : c.status === "已转执法" ? "bg-red-100 dark:bg-red-900/20 text-red-600" : "bg-amber-100 dark:bg-amber-900/20 text-amber-600"}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{c.content}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted-foreground">NLP{locale === "zh" ? "情感分析" : " Sentiment"}:</span>
                      <span className={`font-bold ${c.sentiment < -0.6 ? "text-red-500" : c.sentiment < -0.3 ? "text-amber-600" : "text-sky-600"}`}>{c.sentiment.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "ratings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "景区" : "Scenic"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "综合" : "Overall"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "导游" : "Guide"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "设施" : "Facility"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "餐饮" : "Food"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "交通" : "Transport"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "评价数" : "Reviews"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRatings.map((s) => (
                      <tr key={s.scenic} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{s.scenic}</td>
                        <td className="py-2.5 text-center">
                          <span className="text-sm font-extrabold text-amber-600">{s.overall}</span>
                        </td>
                        {[s.guide, s.facility, s.food, s.transport].map((v, i) => (
                          <td key={i} className="py-2.5 text-center text-xs">
                            <span className={v >= 4.5 ? "text-emerald-600 font-semibold" : v >= 4.0 ? "text-amber-600" : "text-red-500 font-semibold"}>{v}</span>
                          </td>
                        ))}
                        <td className="py-2.5 text-right text-xs text-muted-foreground">{s.reviews.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
