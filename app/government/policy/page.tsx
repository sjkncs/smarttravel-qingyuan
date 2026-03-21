"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, DollarSign, TrendingUp, BarChart3, CheckCircle2,
  Target, ArrowUpRight, Layers, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const policies = [
  {
    name: "乡村旅游扶持专项资金", nameEn: "Rural Tourism Support Fund",
    budget: 500, spent: 380, period: "2025.01-2025.12",
    villages: ["峰林小镇", "千年瑶寨", "上岳古村", "油岭瑶寨", "积庆里"],
    kpis: [
      { name: "游客增长", target: "15%", actual: "18.2%", pass: true },
      { name: "村民收入增长", target: "10%", actual: "22%", pass: true },
      { name: "就业带动", target: "100人", actual: "142人", pass: true },
      { name: "满意度", target: "85%", actual: "92%", pass: true },
    ],
    verdict: "A",
  },
  {
    name: "非遗传承人补贴计划", nameEn: "Heritage Inheritor Subsidy Plan",
    budget: 120, spent: 95, period: "2025.03-2026.03",
    villages: ["千年瑶寨", "油岭瑶寨"],
    kpis: [
      { name: "新增传承人", target: "2人", actual: "3人", pass: true },
      { name: "CPI提升", target: "+3分", actual: "+5分", pass: true },
      { name: "非遗活动增加", target: "20%", actual: "35%", pass: true },
      { name: "学徒留存率", target: "80%", actual: "75%", pass: false },
    ],
    verdict: "A-",
  },
  {
    name: "交通基建专项工程", nameEn: "Transport Infrastructure Project",
    budget: 800, spent: 650, period: "2024.06-2025.12",
    villages: ["油岭瑶寨", "千年瑶寨", "上岳古村"],
    kpis: [
      { name: "RAI提升", target: "+5分", actual: "+8分", pass: true },
      { name: "交通事故率", target: "-30%", actual: "-40%", pass: true },
      { name: "游客可达性", target: "提升至B级", actual: "A级", pass: true },
      { name: "工期完成", target: "100%", actual: "85%", pass: false },
    ],
    verdict: "B+",
  },
];

const fundFlow = [
  { from: "市财政拨付", amount: 1420, to: "文旅专项账户" },
  { from: "文旅专项账户", amount: 500, to: "乡村旅游扶持" },
  { from: "文旅专项账户", amount: 120, to: "非遗传承补贴" },
  { from: "文旅专项账户", amount: 800, to: "交通基建工程" },
];

const quarterlyTrends = [
  { q: "Q1 2025", tourists: 68, revenue: 1280, satisfaction: 88, cbt: 62 },
  { q: "Q2 2025", tourists: 82, revenue: 1560, satisfaction: 90, cbt: 68 },
  { q: "Q3 2025", tourists: 95, revenue: 1820, satisfaction: 91, cbt: 72 },
  { q: "Q4 2025", tourists: 112, revenue: 2100, satisfaction: 93, cbt: 76 },
];

export default function PolicyPage() {
  const { locale } = useI18n();
  const [activePolicy, setActivePolicy] = useState(0);

  const totalBudget = policies.reduce((s, p) => s + p.budget, 0);
  const totalSpent = policies.reduce((s, p) => s + p.spent, 0);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-600" />
              {locale === "zh" ? "政策效果评估系统" : "Policy Impact Assessment System"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "量化评估 · 资金追踪 · A/B对照 · 决策支持" : "Quantitative Assessment · Fund Tracking · A/B Comparison · Decision Support"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/government">{locale === "zh" ? "返回政府版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "评估政策", labelEn: "Policies Assessed", value: `${policies.length}项`, color: "text-violet-600" },
              { icon: DollarSign, label: "总预算", labelEn: "Total Budget", value: `¥${totalBudget}万`, color: "text-emerald-600" },
              { icon: Target, label: "执行率", labelEn: "Execution Rate", value: `${((totalSpent / totalBudget) * 100).toFixed(0)}%`, color: "text-sky-600" },
              { icon: TrendingUp, label: "KPI达标率", labelEn: "KPI Pass Rate", value: "83%", color: "text-amber-600" },
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

          {/* Policy Selector */}
          <div className="flex gap-2 flex-wrap">
            {policies.map((p, i) => (
              <button key={p.name} onClick={() => setActivePolicy(i)} className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${activePolicy === i ? "bg-violet-600 text-white shadow-lg" : "bg-muted hover:bg-muted/80"}`}>
                {locale === "zh" ? p.name : p.nameEn}
              </button>
            ))}
          </div>

          {/* Active Policy Detail */}
          <motion.div key={activePolicy} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{locale === "zh" ? policies[activePolicy].name : policies[activePolicy].nameEn}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span><Calendar className="h-3 w-3 inline mr-0.5" />{policies[activePolicy].period}</span>
                  <span>{locale === "zh" ? "覆盖" : "Covers"}: {policies[activePolicy].villages.join("、")}</span>
                </div>
              </div>
              <div className={`text-2xl font-extrabold px-4 py-1 rounded-xl ${policies[activePolicy].verdict.startsWith("A") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"}`}>
                {policies[activePolicy].verdict}
              </div>
            </div>

            {/* Budget Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{locale === "zh" ? "预算执行" : "Budget Execution"}</span>
                <span className="font-semibold">¥{policies[activePolicy].spent}万 / ¥{policies[activePolicy].budget}万 ({((policies[activePolicy].spent / policies[activePolicy].budget) * 100).toFixed(0)}%)</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(policies[activePolicy].spent / policies[activePolicy].budget) * 100}%` }} transition={{ delay: 0.3, duration: 0.8 }} className="h-full bg-violet-500 rounded-full" />
              </div>
            </div>

            {/* KPI Table */}
            <h4 className="text-sm font-semibold mb-3">{locale === "zh" ? "关键绩效指标(KPI)评估" : "Key Performance Indicator Assessment"}</h4>
            <div className="space-y-2">
              {policies[activePolicy].kpis.map((kpi) => (
                <div key={kpi.name} className={`flex items-center justify-between p-3 rounded-lg border ${kpi.pass ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/5" : "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/5"}`}>
                  <div className="flex items-center gap-2">
                    {kpi.pass ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Target className="h-4 w-4 text-red-400" />}
                    <span className="text-sm font-medium">{kpi.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">{locale === "zh" ? "目标" : "Target"}: {kpi.target}</span>
                    <span className={`font-bold ${kpi.pass ? "text-emerald-600" : "text-red-500"}`}>{locale === "zh" ? "实际" : "Actual"}: {kpi.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fund Flow */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              {locale === "zh" ? "资金流向全链路追踪" : "Full-Chain Fund Flow Tracking"}
            </h3>
            <div className="space-y-2">
              {fundFlow.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 text-xs">
                  <span className="font-medium w-28 text-right">{f.from}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-px bg-violet-300 dark:bg-violet-700" />
                    <span className="font-bold text-violet-600 whitespace-nowrap">¥{f.amount}{locale === "zh" ? "万" : "0K"}</span>
                    <div className="flex-1 h-px bg-violet-300 dark:bg-violet-700" />
                  </div>
                  <span className="font-medium w-28">{f.to}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quarterly Trends */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <BarChart3 className="h-4 w-4 text-sky-500" />
              {locale === "zh" ? "季度效果趋势" : "Quarterly Impact Trends"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2">{locale === "zh" ? "季度" : "Quarter"}</th>
                    <th className="text-right py-2">{locale === "zh" ? "游客(万)" : "Tourists(K)"}</th>
                    <th className="text-right py-2">{locale === "zh" ? "收入(万)" : "Rev(K)"}</th>
                    <th className="text-right py-2">{locale === "zh" ? "满意度" : "Satisfaction"}</th>
                    <th className="text-right py-2">CBT%</th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyTrends.map((q, i) => (
                    <tr key={q.q} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-medium">{q.q}</td>
                      <td className="py-2.5 text-right">{q.tourists / 10}{locale === "zh" ? "万" : "K"}</td>
                      <td className="py-2.5 text-right font-semibold">¥{q.revenue}{locale === "zh" ? "万" : ""}</td>
                      <td className="py-2.5 text-right">
                        <span className="text-emerald-600">{q.satisfaction}%</span>
                        {i > 0 && <span className="text-[10px] text-emerald-500 ml-1">+{q.satisfaction - quarterlyTrends[i - 1].satisfaction}%</span>}
                      </td>
                      <td className="py-2.5 text-right">
                        {q.cbt}%
                        {i > 0 && <span className="text-[10px] text-emerald-500 ml-1">+{q.cbt - quarterlyTrends[i - 1].cbt}%</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
