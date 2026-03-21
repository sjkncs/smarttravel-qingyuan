"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Shield, TreePine, AlertTriangle, Eye,
  TrendingUp, ArrowUpRight, MapPin, RefreshCw, Activity, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

const kpis = [
  { id: "tourists", title: "本月游客总量", titleEn: "Monthly Tourists", value: 284600, suffix: "", change: 18.2, icon: Users, color: "text-violet-600" },
  { id: "revenue", title: "旅游总收入", titleEn: "Total Revenue", value: 5680, suffix: "万", change: 15.4, icon: TrendingUp, color: "text-emerald-600" },
  { id: "vsi", title: "平均VSI安全指数", titleEn: "Avg VSI Safety", value: 91.3, suffix: "", change: 2.1, icon: Shield, color: "text-sky-600" },
  { id: "cpi", title: "平均CPI文化指数", titleEn: "Avg CPI Cultural", value: 85.8, suffix: "", change: 0.8, icon: FileText, color: "text-amber-500" },
];

const villageData = [
  { name: "峰林小镇", vsi: 95, cpi: 78, rai: 92, visitors: 82400, cbt: 73, youth: 12 },
  { name: "千年瑶寨", vsi: 88, cpi: 98, rai: 75, visitors: 65800, cbt: 89, youth: 8 },
  { name: "上岳古村", vsi: 92, cpi: 85, rai: 88, visitors: 48200, cbt: 68, youth: 5 },
  { name: "油岭瑶寨", vsi: 82, cpi: 96, rai: 68, visitors: 38600, cbt: 82, youth: 6 },
  { name: "积庆里", vsi: 94, cpi: 72, rai: 90, visitors: 49600, cbt: 65, youth: 4 },
];

const alerts = [
  { level: "warning", title: "峰林小镇容量预警", titleEn: "Fenglin Capacity Alert", desc: "当前客流82,400已达容量80%，建议启动分流", time: "10分钟前" },
  { level: "info", title: "盘王节文化保护提醒", titleEn: "Pan Wang Festival Reminder", desc: "盘王节期间(农历十月)千年瑶寨CPI敏感度提升至「高」级", time: "1小时前" },
  { level: "success", title: "积庆里基建完工", titleEn: "Jiqingli Infrastructure Complete", desc: "积庆里停车场扩建完成，RAI指数提升3分至90分", time: "3小时前" },
];

const policyEffects = [
  { policy: "乡村旅游扶持资金", budget: 500, spent: 380, villages: 5, effect: "游客增长18%，村民收入增长22%" },
  { policy: "非遗传承人补贴", budget: 120, spent: 95, villages: 2, effect: "新增3位青年传承人，CPI提升5分" },
  { policy: "道路基建专项", budget: 800, spent: 650, villages: 3, effect: "RAI平均提升8分，事故率下降40%" },
];

export default function CockpitPage() {
  const { locale } = useI18n();
  const [animate, setAnimate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => { setAnimate(true); }, []);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-600" />
              {locale === "zh" ? "文旅大数据驾驶舱" : "Tourism Big Data Cockpit"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === "zh" ? "实时数据 · " : "Real-time · "}{lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />{locale === "zh" ? "刷新" : "Refresh"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/government">{locale === "zh" ? "返回政府版" : "Back"}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k, idx) => (
              <motion.div
                key={k.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? k.title : k.titleEn}</span>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <div className="text-2xl font-bold">
                  <NumberFlow value={animate ? k.value : 0} format={{ maximumFractionDigits: k.value % 1 === 0 ? 0 : 1 }} />
                  {k.suffix && <span className="text-base ml-0.5">{k.suffix}</span>}
                </div>
                <div className="flex items-center gap-0.5 text-xs mt-1 text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  {k.change}%
                  <span className="text-muted-foreground ml-1">{locale === "zh" ? "较上月" : "vs last month"}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Village Multi-Index Table */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
                <MapPin className="h-4 w-4 text-violet-500" />
                {locale === "zh" ? "村落多维指数监控" : "Village Multi-Index Monitor"}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2 font-medium">{locale === "zh" ? "村落" : "Village"}</th>
                      <th className="text-center py-2 font-medium">VSI</th>
                      <th className="text-center py-2 font-medium">CPI</th>
                      <th className="text-center py-2 font-medium">RAI</th>
                      <th className="text-right py-2 font-medium">{locale === "zh" ? "游客" : "Visitors"}</th>
                      <th className="text-center py-2 font-medium">CBT%</th>
                      <th className="text-center py-2 font-medium">{locale === "zh" ? "回流" : "Return"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villageData.map((v) => (
                      <tr key={v.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{v.name}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.vsi >= 90 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : v.vsi >= 80 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                            {v.vsi}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.cpi >= 90 ? "bg-violet-50 dark:bg-violet-900/20 text-violet-600" : "bg-sky-50 dark:bg-sky-900/20 text-sky-600"}`}>
                            {v.cpi}
                          </span>
                        </td>
                        <td className="py-2.5 text-center text-xs font-semibold">{v.rai}</td>
                        <td className="py-2.5 text-right text-xs">{(v.visitors / 10000).toFixed(1)}万</td>
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${v.cbt}%` }} />
                            </div>
                            <span className="text-[10px]">{v.cbt}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center text-xs">{v.youth}{locale === "zh" ? "人" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Alerts */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {locale === "zh" ? "实时预警" : "Alerts"}
              </h3>
              <div className="space-y-3">
                {alerts.map((a, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs ${
                      a.level === "warning" ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" :
                      a.level === "info" ? "bg-sky-50/50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-800" :
                      "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{locale === "zh" ? a.title : a.titleEn}</span>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Policy Effects */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <TreePine className="h-4 w-4 text-emerald-500" />
              {locale === "zh" ? "政策效果评估" : "Policy Impact Assessment"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {policyEffects.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-muted/20">
                  <h4 className="text-sm font-bold mb-2">{p.policy}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{locale === "zh" ? "预算/执行" : "Budget/Spent"}</span>
                      <span className="font-semibold">{p.spent}/{p.budget} {locale === "zh" ? "万" : "0K"}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(p.spent / p.budget) * 100}%` }} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{locale === "zh" ? "覆盖村落" : "Villages"}</span>
                      <span className="font-semibold">{p.villages}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300">
                      <span className="font-medium">{locale === "zh" ? "效果: " : "Effect: "}</span>{p.effect}
                    </div>
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
