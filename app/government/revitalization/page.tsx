"use client";

import { motion } from "framer-motion";
import {
  TreePine, Users, TrendingUp, DollarSign, GraduationCap,
  ArrowUpRight, UserCheck, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const villages = [
  { name: "峰林小镇", income: 186, incomeGrowth: 22, localJobs: 142, youthReturn: 12, industries: ["温泉旅游", "民宿经营", "农产品加工"], satisfaction: 94 },
  { name: "千年瑶寨", income: 128, incomeGrowth: 18, localJobs: 95, youthReturn: 8, industries: ["文化体验", "瑶族手工艺", "民族表演"], satisfaction: 91 },
  { name: "上岳古村", income: 92, incomeGrowth: 25, localJobs: 68, youthReturn: 5, industries: ["古建修复", "民宿经营", "研学教育"], satisfaction: 88 },
  { name: "油岭瑶寨", income: 76, incomeGrowth: 15, localJobs: 52, youthReturn: 6, industries: ["农耕体验", "瑶族医药", "民族节庆"], satisfaction: 85 },
  { name: "积庆里", income: 98, incomeGrowth: 20, localJobs: 78, youthReturn: 4, industries: ["采茶体验", "围龙屋参观", "有机农业"], satisfaction: 90 },
];

const youthProfiles = [
  { name: "瑶妹小兰", age: 26, village: "千年瑶寨", returnDate: "2025.06", role: "瑶绣工坊创始人", income: "月均¥8,500" },
  { name: "阿明", age: 28, village: "峰林小镇", returnDate: "2025.03", role: "民宿管理经理", income: "月均¥12,000" },
  { name: "小慧", age: 24, village: "上岳古村", returnDate: "2025.09", role: "研学导师", income: "月均¥7,200" },
  { name: "阿强", age: 30, village: "油岭瑶寨", returnDate: "2024.12", role: "瑶医药传承学徒", income: "月均¥6,800" },
];

export default function RevitalizationPage() {
  const { locale } = useI18n();
  const totalIncome = villages.reduce((s, v) => s + v.income, 0);
  const totalYouth = villages.reduce((s, v) => s + v.youthReturn, 0);
  const totalJobs = villages.reduce((s, v) => s + v.localJobs, 0);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <TreePine className="h-5 w-5 text-emerald-600" />
              {locale === "zh" ? "乡村振兴数字化平台" : "Rural Revitalization Platform"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "CBT追踪 · 青年回流 · 产业发展" : "CBT Tracking · Youth Return · Industry Development"}</p>
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
              { icon: DollarSign, label: "村落总收入", labelEn: "Total Revenue", value: `¥${totalIncome}万`, color: "text-emerald-600" },
              { icon: UserCheck, label: "在地就业", labelEn: "Local Jobs", value: `${totalJobs}人`, color: "text-sky-600" },
              { icon: GraduationCap, label: "青年回流", labelEn: "Youth Return", value: `${totalYouth}人`, color: "text-violet-600" },
              { icon: Home, label: "覆盖村落", labelEn: "Villages", value: "5个", color: "text-amber-600" },
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

          {/* Village Cards */}
          {villages.map((v, vi) => (
            <motion.div key={v.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 + vi * 0.08 }} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-1.5"><TreePine className="h-4 w-4 text-emerald-500" />{v.name}</h3>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{locale === "zh" ? `收入增长${v.incomeGrowth}%` : `+${v.incomeGrowth}% revenue`}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">¥{v.income}万</div>
                  <div className="text-muted-foreground">{locale === "zh" ? "月收入" : "Monthly Rev"}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{v.localJobs}</div>
                  <div className="text-muted-foreground">{locale === "zh" ? "在地就业" : "Local Jobs"}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{v.youthReturn}</div>
                  <div className="text-muted-foreground">{locale === "zh" ? "青年回流" : "Youth Return"}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold">{v.satisfaction}%</div>
                  <div className="text-muted-foreground">{locale === "zh" ? "满意度" : "Satisfaction"}</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 col-span-2 md:col-span-1">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {v.industries.map((ind) => (
                      <span key={ind} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600">{ind}</span>
                    ))}
                  </div>
                  <div className="text-muted-foreground mt-1">{locale === "zh" ? "支柱产业" : "Industries"}</div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Youth Return Stories */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <GraduationCap className="h-4 w-4 text-violet-500" />
              {locale === "zh" ? "青年回流典型案例" : "Youth Return Success Stories"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {youthProfiles.map((y) => (
                <div key={y.name} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold">{y.name} <span className="text-muted-foreground font-normal text-xs">({y.age}{locale === "zh" ? "岁" : "yo"})</span></span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-600">{y.village}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{locale === "zh" ? "回流时间" : "Return"}: {y.returnDate} · {y.role} · {y.income}</div>
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
