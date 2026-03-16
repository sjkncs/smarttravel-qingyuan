"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Database, Ticket, Users, AlertTriangle, Wrench, Star,
  DollarSign, TrendingUp, Clock, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const tickets = [
  { id: "TK-0313-001", product: "峰林小镇+温泉2日游", qty: 2, price: 598, status: "used", time: "09:32" },
  { id: "TK-0313-002", product: "千年瑶寨文化体验", qty: 4, price: 298, status: "valid", time: "10:15" },
  { id: "TK-0313-003", product: "积庆里采茶之旅", qty: 1, price: 168, status: "valid", time: "10:45" },
  { id: "TK-0313-004", product: "油岭瑶寨开耕节", qty: 3, price: 388, status: "refunded", time: "11:02" },
  { id: "TK-0313-005", product: "上岳古村深度游", qty: 2, price: 258, status: "used", time: "11:30" },
];

const devices = [
  { name: "闸机A-01", location: "峰林小镇入口", status: "online", battery: 95 },
  { name: "摄像头C-12", location: "千年瑶寨广场", status: "online", battery: 82 },
  { name: "温湿度S-03", location: "积庆里茶园", status: "warning", battery: 23 },
  { name: "闸机A-02", location: "峰林小镇出口", status: "online", battery: 88 },
  { name: "客流计数F-05", location: "上岳古村入口", status: "offline", battery: 0 },
];

const npsData = [
  { village: "峰林小镇", score: 4.8, reviews: 1245, trend: "+0.2" },
  { village: "千年瑶寨", score: 4.6, reviews: 892, trend: "+0.1" },
  { village: "上岳古村", score: 4.5, reviews: 534, trend: "+0.3" },
  { village: "油岭瑶寨", score: 4.3, reviews: 421, trend: "-0.1" },
  { village: "积庆里", score: 4.7, reviews: 678, trend: "+0.2" },
];

export default function OperationsPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"tickets" | "devices" | "nps">("tickets");

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              {locale === "zh" ? "景区运营中台" : "Scenic Operations Hub"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "票务 · IoT · NPS · 财务一站式管理" : "Ticketing · IoT · NPS · Finance All-in-One"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Ticket, label: "今日售票", labelEn: "Today Tickets", value: "2,847", color: "text-sky-600" },
              { icon: DollarSign, label: "今日营收", labelEn: "Today Revenue", value: "¥386K", color: "text-emerald-600" },
              { icon: Wrench, label: "设备在线", labelEn: "Devices Online", value: "42/45", color: "text-amber-600" },
              { icon: Star, label: "平均NPS", labelEn: "Avg NPS", value: "4.58", color: "text-violet-600" },
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

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            {([
              { id: "tickets" as const, label: "票务管理", labelEn: "Ticketing", icon: Ticket },
              { id: "devices" as const, label: "IoT设备", labelEn: "IoT Devices", icon: Wrench },
              { id: "nps" as const, label: "NPS评价", labelEn: "NPS Reviews", icon: Star },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {/* Tickets Tab */}
          {tab === "tickets" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "票号" : "Ticket ID"}</th>
                      <th className="text-left py-2">{locale === "zh" ? "产品" : "Product"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "数量" : "Qty"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "金额" : "Amount"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "状态" : "Status"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "时间" : "Time"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-mono text-xs text-muted-foreground">{t.id}</td>
                        <td className="py-2.5 font-medium">{t.product}</td>
                        <td className="py-2.5 text-center">{t.qty}</td>
                        <td className="py-2.5 text-right font-semibold">¥{t.price}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.status === "used" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : t.status === "valid" ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                            {t.status === "used" ? (locale === "zh" ? "已使用" : "Used") : t.status === "valid" ? (locale === "zh" ? "有效" : "Valid") : (locale === "zh" ? "已退款" : "Refunded")}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-xs text-muted-foreground">{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Devices Tab */}
          {tab === "devices" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {devices.map((d) => (
                  <div key={d.name} className={`flex items-center justify-between p-3 rounded-lg border ${d.status === "offline" ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10" : d.status === "warning" ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10" : "border-border"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${d.status === "online" ? "bg-emerald-500" : d.status === "warning" ? "bg-amber-500 animate-pulse" : "bg-red-500"}`} />
                      <div>
                        <div className="text-sm font-medium">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{d.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-medium">{d.battery > 0 ? `${d.battery}%` : "N/A"}</div>
                        <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "电量" : "Battery"}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${d.status === "online" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : d.status === "warning" ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600" : "bg-red-100 dark:bg-red-900/20 text-red-500"}`}>
                        {d.status === "online" ? (locale === "zh" ? "在线" : "Online") : d.status === "warning" ? (locale === "zh" ? "低电量" : "Low") : (locale === "zh" ? "离线" : "Offline")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* NPS Tab */}
          {tab === "nps" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {npsData.map((n) => (
                  <div key={n.village} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="text-sm font-bold">{n.village}</div>
                      <div className="text-[10px] text-muted-foreground">{n.reviews} {locale === "zh" ? "条评价" : "reviews"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(n.score) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                      <div className="text-lg font-bold">{n.score}</div>
                      <span className={`text-xs font-medium ${n.trend.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{n.trend}</span>
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
