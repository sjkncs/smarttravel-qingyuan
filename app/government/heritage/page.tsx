"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, BookOpen, Users, AlertTriangle, MapPin, Eye,
  TrendingUp, Clock, Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const heritageItems = [
  { name: "瑶族长鼓舞", level: "国家级", village: "千年瑶寨", inheritors: 3, risk: "中", activity: 12, cpi: 92 },
  { name: "瑶族刺绣", level: "省级", village: "油岭瑶寨", inheritors: 2, risk: "高", activity: 8, cpi: 78 },
  { name: "瑶族婚俗", level: "省级", village: "千年瑶寨", inheritors: 1, risk: "高", activity: 4, cpi: 65 },
  { name: "瑶医药浴", level: "市级", village: "油岭瑶寨", inheritors: 2, risk: "中", activity: 10, cpi: 85 },
  { name: "岭南围龙屋营造", level: "省级", village: "积庆里", inheritors: 1, risk: "高", activity: 3, cpi: 62 },
  { name: "上岳灰塑工艺", level: "市级", village: "上岳古村", inheritors: 1, risk: "极高", activity: 2, cpi: 48 },
];

const inheritors = [
  { name: "盘奶奶", age: 78, heritage: "瑶族长鼓舞", village: "千年瑶寨", apprentices: 5, status: "活跃", health: "良好" },
  { name: "房阿姨", age: 65, heritage: "瑶族刺绣", village: "油岭瑶寨", apprentices: 3, status: "活跃", health: "良好" },
  { name: "唐师傅", age: 72, heritage: "瑶医药浴", village: "油岭瑶寨", apprentices: 2, status: "活跃", health: "一般" },
  { name: "李爷爷", age: 81, heritage: "上岳灰塑工艺", village: "上岳古村", apprentices: 0, status: "半退休", health: "一般" },
];

const sensitivityZones = [
  { zone: "千年瑶寨核心区", level: "极高", maxCapacity: 3000, currentLoad: 2400, alert: false },
  { zone: "盘王节仪式场", level: "极高", maxCapacity: 500, currentLoad: 120, alert: false },
  { zone: "上岳古村祠堂群", level: "高", maxCapacity: 800, currentLoad: 650, alert: true },
  { zone: "油岭瑶寨药园", level: "中", maxCapacity: 200, currentLoad: 85, alert: false },
];

export default function HeritagePage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"items" | "inheritors" | "zones">("items");

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              {locale === "zh" ? "文化遗产保护监测" : "Cultural Heritage Monitoring"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "CPI指数 · 非遗监测 · 传承人图谱 · 敏感区管控" : "CPI Index · Heritage Monitor · Inheritor Graph · Sensitivity Zones"}</p>
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
              { icon: BookOpen, label: "非遗项目", labelEn: "Heritage Items", value: "6项", color: "text-amber-600" },
              { icon: Users, label: "传承人", labelEn: "Inheritors", value: "8位", color: "text-violet-600" },
              { icon: AlertTriangle, label: "高风险项目", labelEn: "High Risk", value: "3项", color: "text-red-500" },
              { icon: Shield, label: "平均CPI", labelEn: "Avg CPI", value: "71.7", color: "text-emerald-600" },
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
              { id: "items" as const, label: "非遗项目", labelEn: "Heritage Items", icon: BookOpen },
              { id: "inheritors" as const, label: "传承人图谱", labelEn: "Inheritors", icon: Users },
              { id: "zones" as const, label: "敏感区管控", labelEn: "Sensitivity Zones", icon: MapPin },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {tab === "items" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "非遗项目" : "Heritage"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "级别" : "Level"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "村落" : "Village"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "传承人" : "Inheritors"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "濒危度" : "Risk"}</th>
                      <th className="text-center py-2">CPI</th>
                      <th className="text-right py-2">{locale === "zh" ? "年活动" : "Events/yr"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heritageItems.map((h) => (
                      <tr key={h.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{h.name}</td>
                        <td className="py-2.5 text-center"><span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600">{h.level}</span></td>
                        <td className="py-2.5 text-center text-xs">{h.village}</td>
                        <td className="py-2.5 text-center">{h.inheritors}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${h.risk === "极高" ? "bg-red-100 dark:bg-red-900/20 text-red-600" : h.risk === "高" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-sky-100 dark:bg-sky-900/20 text-sky-600"}`}>{h.risk}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`text-xs font-bold ${h.cpi >= 80 ? "text-emerald-600" : h.cpi >= 60 ? "text-amber-600" : "text-red-500"}`}>{h.cpi}</span>
                        </td>
                        <td className="py-2.5 text-right text-xs">{h.activity}{locale === "zh" ? "次" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "inheritors" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {inheritors.map((p) => (
                  <div key={p.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Heart className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">{p.name} <span className="text-muted-foreground font-normal text-xs">({p.age}{locale === "zh" ? "岁" : "yo"})</span></div>
                        <div className="text-[10px] text-muted-foreground">{p.heritage} · {p.village}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-bold">{p.apprentices}</div>
                        <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "学徒" : "Apprent."}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.status === "活跃" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/20 text-amber-600"}`}>{p.status}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${p.health === "良好" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-100 dark:bg-amber-900/20 text-amber-600"}`}>{p.health}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "zones" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {sensitivityZones.map((z) => {
                  const loadPct = (z.currentLoad / z.maxCapacity) * 100;
                  return (
                    <div key={z.zone} className={`p-4 rounded-xl border ${z.alert ? "border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10" : "border-border"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-bold">{z.zone}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${z.level === "极高" ? "bg-red-100 dark:bg-red-900/20 text-red-600" : z.level === "高" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-sky-100 dark:bg-sky-900/20 text-sky-600"}`}>{locale === "zh" ? `${z.level}敏感` : `${z.level} Sens.`}</span>
                          {z.alert && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                        </div>
                        <span className="text-xs">{z.currentLoad}/{z.maxCapacity}</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${loadPct}%` }} transition={{ delay: 0.3, duration: 0.8 }} className={`h-full rounded-full ${loadPct > 80 ? "bg-red-500" : loadPct > 60 ? "bg-amber-500" : "bg-emerald-500"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
