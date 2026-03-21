"use client";

import { motion } from "framer-motion";
import {
  LineChart, Users, TreePine, TrendingUp, ArrowUpRight,
  DollarSign, Leaf, UserCheck, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const villages = [
  {
    name: "峰林小镇", revenue: 186, localShare: 68, localJobs: 142, youthReturn: 12, carbon: 2.4,
    distribution: [
      { to: "村集体", pct: 35 }, { to: "合作社", pct: 25 }, { to: "村民直接", pct: 22 }, { to: "平台服务费", pct: 10 }, { to: "文保基金", pct: 8 },
    ],
  },
  {
    name: "千年瑶寨", revenue: 128, localShare: 82, localJobs: 95, youthReturn: 8, carbon: 1.8,
    distribution: [
      { to: "村集体", pct: 30 }, { to: "瑶族手艺人", pct: 28 }, { to: "村民直接", pct: 20 }, { to: "非遗保护", pct: 15 }, { to: "平台服务费", pct: 7 },
    ],
  },
  {
    name: "上岳古村", revenue: 92, localShare: 71, localJobs: 68, youthReturn: 5, carbon: 1.2,
    distribution: [
      { to: "村集体", pct: 32 }, { to: "民宿经营者", pct: 26 }, { to: "村民直接", pct: 24 }, { to: "古建维护", pct: 12 }, { to: "平台服务费", pct: 6 },
    ],
  },
];

const esgMetrics = [
  { category: "E - 环境", categoryEn: "E - Environment", items: [{ name: "碳足迹(吨CO₂)", value: "5.4", trend: "-12%" }, { name: "绿色交通占比", value: "38%", trend: "+8%" }] },
  { category: "S - 社会", categoryEn: "S - Social", items: [{ name: "在地雇佣率", value: "73%", trend: "+5%" }, { name: "少数民族参与", value: "89%", trend: "+3%" }] },
  { category: "G - 治理", categoryEn: "G - Governance", items: [{ name: "收入透明度", value: "100%", trend: "—" }, { name: "审计合规", value: "通过", trend: "—" }] },
];

export default function CBTPage() {
  const { locale } = useI18n();

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-amber-600" />
              {locale === "zh" ? "CBT 可持续旅游引擎" : "CBT Sustainability Engine"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "收入透明 · 社区受益 · ESG合规" : "Transparent Revenue · Community Benefit · ESG"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: DollarSign, label: "总旅游收入", labelEn: "Total Revenue", value: "¥406万", color: "text-emerald-600" },
              { icon: UserCheck, label: "平均在地雇佣率", labelEn: "Local Employment", value: "73%", color: "text-sky-600" },
              { icon: GraduationCap, label: "青年回流总数", labelEn: "Youth Return", value: "25人", color: "text-violet-600" },
              { icon: Leaf, label: "碳足迹(月)", labelEn: "Carbon Footprint", value: "5.4t", color: "text-amber-600" },
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

          {/* Village Income Distribution */}
          {villages.map((v, vi) => (
            <motion.div key={v.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + vi * 0.1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <TreePine className="h-4 w-4 text-emerald-500" />{v.name}
                </h3>
                <div className="flex items-center gap-4 text-xs">
                  <span>{locale === "zh" ? "月收入" : "Revenue"}: <strong>¥{v.revenue}万</strong></span>
                  <span>{locale === "zh" ? "在地雇佣" : "Local Jobs"}: <strong>{v.localJobs}</strong></span>
                  <span>{locale === "zh" ? "青年回流" : "Youth"}: <strong>{v.youthReturn}人</strong></span>
                </div>
              </div>
              <div className="space-y-2">
                {v.distribution.map((d) => (
                  <div key={d.to} className="flex items-center gap-3">
                    <span className="text-xs w-20 text-right text-muted-foreground">{d.to}</span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.pct}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-linear-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-end pr-2"
                      >
                        <span className="text-[10px] font-bold text-white">{d.pct}%</span>
                      </motion.div>
                    </div>
                    <span className="text-xs font-semibold w-14 text-right">¥{(v.revenue * d.pct / 100).toFixed(1)}万</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* ESG Report */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <Leaf className="h-4 w-4 text-emerald-500" />
              {locale === "zh" ? "ESG 合规报告摘要" : "ESG Compliance Report Summary"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {esgMetrics.map((cat) => (
                <div key={cat.category} className="p-4 rounded-xl border border-border bg-muted/20">
                  <h4 className="text-xs font-bold mb-3 text-emerald-700 dark:text-emerald-400">{locale === "zh" ? cat.category : cat.categoryEn}</h4>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{item.value}</span>
                          {item.trend !== "—" && <span className={`text-[10px] ${item.trend.startsWith("+") || item.trend.startsWith("-") ? (item.trend.startsWith("-") && item.name.includes("碳") ? "text-emerald-600" : item.trend.startsWith("+") ? "text-emerald-600" : "text-red-500") : ""}`}>{item.trend}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
