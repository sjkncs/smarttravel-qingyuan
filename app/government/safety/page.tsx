"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Siren, Shield, AlertTriangle, Cloud, Users, MapPin,
  ThermometerSun, Wind, Droplets, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const villageVSI = [
  { name: "峰林小镇", vsi: 95, weather: 98, crowd: 82, infra: 96, sentiment: 97, emergency: 95 },
  { name: "千年瑶寨", vsi: 88, weather: 92, crowd: 78, infra: 85, sentiment: 90, emergency: 88 },
  { name: "上岳古村", vsi: 92, weather: 95, crowd: 90, infra: 88, sentiment: 93, emergency: 91 },
  { name: "油岭瑶寨", vsi: 82, weather: 88, crowd: 85, infra: 72, sentiment: 82, emergency: 78 },
  { name: "积庆里", vsi: 94, weather: 96, crowd: 92, infra: 94, sentiment: 95, emergency: 93 },
];

const weatherAlerts = [
  { type: "暴雨黄色预警", typeEn: "Heavy Rain Yellow Alert", area: "连南县", start: "03/14 06:00", end: "03/14 18:00", level: "warning", action: "已通知景区启动防汛预案" },
  { type: "大雾橙色预警", typeEn: "Dense Fog Orange Alert", area: "英德市", start: "03/14 05:00", end: "03/14 10:00", level: "warning", action: "高速路口限行已启动" },
];

const incidents = [
  { id: "INC-001", time: "03/13 15:32", type: "游客受伤", location: "峰林小镇栈道", status: "已处理", response: "2min", desc: "游客滑倒轻伤，已送医" },
  { id: "INC-002", time: "03/12 11:05", type: "设备故障", location: "千年瑶寨闸机", status: "已修复", response: "8min", desc: "入口闸机卡死，维修完毕" },
  { id: "INC-003", time: "03/10 09:18", type: "客流预警", location: "上岳古村", status: "已分流", response: "3min", desc: "客流达80%容量，启动分流" },
];

const evacuationRoutes = [
  { from: "峰林小镇核心区", to: "停车场A", distance: "800m", time: "8min", capacity: 5000 },
  { from: "千年瑶寨广场", to: "应急集结点", distance: "500m", time: "5min", capacity: 3000 },
  { from: "上岳古村祠堂", to: "村口广场", distance: "300m", time: "3min", capacity: 1500 },
];

export default function SafetyPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"vsi" | "weather" | "incidents" | "routes">("vsi");

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Siren className="h-5 w-5 text-red-600" />
              {locale === "zh" ? "旅游安全应急指挥中心" : "Tourism Safety Command Center"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "VSI安全指数 · 气象联动 · 应急指挥 · 疏散路径" : "VSI Safety · Weather · Emergency · Evacuation"}</p>
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
              { icon: Shield, label: "平均VSI", labelEn: "Avg VSI", value: "90.2", color: "text-emerald-600" },
              { icon: AlertTriangle, label: "活跃预警", labelEn: "Active Alerts", value: `${weatherAlerts.length}项`, color: "text-amber-600" },
              { icon: Siren, label: "本月事件", labelEn: "Monthly Incidents", value: `${incidents.length}起`, color: "text-red-500" },
              { icon: CheckCircle2, label: "平均响应", labelEn: "Avg Response", value: "<3min", color: "text-sky-600" },
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

          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit flex-wrap">
            {([
              { id: "vsi" as const, label: "VSI安全指数", labelEn: "VSI Index", icon: Shield },
              { id: "weather" as const, label: "气象预警", labelEn: "Weather Alerts", icon: Cloud },
              { id: "incidents" as const, label: "事件管理", labelEn: "Incidents", icon: Siren },
              { id: "routes" as const, label: "疏散路径", labelEn: "Evacuation", icon: MapPin },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {tab === "vsi" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "村落" : "Village"}</th>
                      <th className="text-center py-2 font-bold">VSI</th>
                      <th className="text-center py-2">{locale === "zh" ? "气象" : "Weather"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "客流" : "Crowd"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "基建" : "Infra"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "舆情" : "Sentiment"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "应急" : "Emergency"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villageVSI.map((v) => (
                      <tr key={v.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{v.name}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-full ${v.vsi >= 90 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : v.vsi >= 80 ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>{v.vsi}</span>
                        </td>
                        {[v.weather, v.crowd, v.infra, v.sentiment, v.emergency].map((s, i) => (
                          <td key={i} className="py-2.5 text-center text-xs">
                            <span className={s >= 90 ? "text-emerald-600" : s >= 80 ? "text-amber-600" : "text-red-500"}>{s}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "weather" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {weatherAlerts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  {locale === "zh" ? "当前无气象预警" : "No weather alerts"}
                </div>
              ) : weatherAlerts.map((a, i) => (
                <div key={i} className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-bold">{locale === "zh" ? a.type : a.typeEn}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 font-medium">{a.area}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>{locale === "zh" ? "时段" : "Period"}: {a.start} ~ {a.end}</div>
                    <div>{locale === "zh" ? "已采取措施" : "Action"}: {a.action}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === "incidents" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{inc.id}</span>
                        <span className="text-sm font-bold">{inc.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">{inc.status}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{inc.time}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />{inc.location} · {locale === "zh" ? "响应" : "Response"}: {inc.response} · {inc.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "routes" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {evacuationRoutes.map((r) => (
                  <div key={r.from} className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold">{r.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-sm font-bold text-emerald-600">{r.to}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{locale === "zh" ? "距离" : "Dist"}: {r.distance}</span>
                      <span>{locale === "zh" ? "步行" : "Walk"}: {r.time}</span>
                      <span>{locale === "zh" ? "容量" : "Capacity"}: {r.capacity}{locale === "zh" ? "人" : ""}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/20 text-sky-600">A*{locale === "zh" ? "最优路径" : " optimal"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
