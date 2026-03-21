"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Eye, TrendingUp, ArrowUpRight, ArrowDownRight,
  MapPin, Calendar, Clock, DollarSign, Star, Activity, Layers, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

interface MetricCard {
  id: string;
  title: string;
  titleEn: string;
  value: number;
  suffix: string;
  change: number;
  icon: typeof Users;
  color: string;
}

const metrics: MetricCard[] = [
  { id: "visitors", title: "今日游客", titleEn: "Today Visitors", value: 12847, suffix: "", change: 12.5, icon: Users, color: "text-sky-600" },
  { id: "revenue", title: "今日营收", titleEn: "Today Revenue", value: 386, suffix: "K", change: 8.3, icon: DollarSign, color: "text-emerald-600" },
  { id: "satisfaction", title: "满意度", titleEn: "Satisfaction", value: 96.2, suffix: "%", change: 1.2, icon: Star, color: "text-amber-500" },
  { id: "active", title: "在线景区", titleEn: "Active Scenic", value: 5, suffix: "", change: 0, icon: Activity, color: "text-violet-600" },
];

const villageTraffic = [
  { name: "峰林小镇", visitors: 3842, capacity: 5000, trend: 15 },
  { name: "千年瑶寨", visitors: 2956, capacity: 4000, trend: -3 },
  { name: "上岳古村", visitors: 2134, capacity: 3000, trend: 8 },
  { name: "油岭瑶寨", visitors: 1876, capacity: 2500, trend: 22 },
  { name: "积庆里", visitors: 2039, capacity: 3500, trend: 5 },
];

const recentOrders = [
  { id: "ORD-20260313-001", product: "峰林小镇+温泉2日游", amount: 598, status: "paid", time: "14:32" },
  { id: "ORD-20260313-002", product: "千年瑶寨文化体验", amount: 298, status: "paid", time: "14:18" },
  { id: "ORD-20260313-003", product: "积庆里采茶之旅", amount: 168, status: "pending", time: "13:55" },
  { id: "ORD-20260313-004", product: "清远5村深度3日游", amount: 1280, status: "paid", time: "13:40" },
  { id: "ORD-20260313-005", product: "油岭瑶寨开耕节体验", amount: 388, status: "refund", time: "13:22" },
];

const hourlyData = [320, 180, 95, 60, 45, 120, 580, 1200, 1850, 2100, 2400, 2680, 2450, 2200, 2350, 2500, 2100, 1800, 1200, 800, 450, 320, 200, 150];

export default function DashboardPage() {
  const { locale } = useI18n();
  const [animate, setAnimate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setAnimate(true);
    const timer = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const maxHourly = Math.max(...hourlyData);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-600" />
              {locale === "zh" ? "企业数据看板" : "Enterprise Dashboard"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === "zh" ? "最后更新: " : "Updated: "}{lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLastUpdate(new Date())}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />{locale === "zh" ? "刷新" : "Refresh"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, idx) => (
              <motion.div
                key={m.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? m.title : m.titleEn}</span>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div className="text-2xl font-bold">
                  <NumberFlow value={animate ? m.value : 0} format={{ maximumFractionDigits: m.value % 1 === 0 ? 0 : 1 }} />
                  {m.suffix}
                </div>
                {m.change !== 0 && (
                  <div className={`flex items-center gap-0.5 text-xs mt-1 ${m.change > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {m.change > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(m.change)}%
                    <span className="text-muted-foreground ml-1">{locale === "zh" ? "较昨日" : "vs yesterday"}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Traffic Chart */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-sky-500" />
                  {locale === "zh" ? "24小时客流趋势" : "24h Traffic Trend"}
                </h3>
                <span className="text-xs text-muted-foreground">{locale === "zh" ? "今日累计 12,847 人次" : "Total: 12,847"}</span>
              </div>
              <div className="flex items-end gap-[3px] h-32">
                {hourlyData.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / maxHourly) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.02, duration: 0.4 }}
                    className={`flex-1 rounded-t-sm ${
                      i === new Date().getHours()
                        ? "bg-sky-500"
                        : "bg-sky-200 dark:bg-sky-800/50"
                    }`}
                    title={`${i}:00 - ${v} visitors`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
              </div>
            </motion.div>

            {/* Village Capacity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
                <Layers className="h-4 w-4 text-emerald-500" />
                {locale === "zh" ? "景区容量监控" : "Capacity Monitor"}
              </h3>
              <div className="space-y-3">
                {villageTraffic.map((v) => {
                  const pct = (v.visitors / v.capacity) * 100;
                  const isHigh = pct > 80;
                  return (
                    <div key={v.name}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{v.name}</span>
                        <span className={isHigh ? "text-red-500 font-semibold" : "text-muted-foreground"}>
                          {v.visitors}/{v.capacity}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6, duration: 0.5 }}
                          className={`h-full rounded-full ${isHigh ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Recent Orders */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <Clock className="h-4 w-4 text-amber-500" />
              {locale === "zh" ? "最近订单" : "Recent Orders"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-left py-2 font-medium">{locale === "zh" ? "订单号" : "Order ID"}</th>
                    <th className="text-left py-2 font-medium">{locale === "zh" ? "产品" : "Product"}</th>
                    <th className="text-right py-2 font-medium">{locale === "zh" ? "金额" : "Amount"}</th>
                    <th className="text-center py-2 font-medium">{locale === "zh" ? "状态" : "Status"}</th>
                    <th className="text-right py-2 font-medium">{locale === "zh" ? "时间" : "Time"}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 text-xs font-mono text-muted-foreground">{o.id}</td>
                      <td className="py-2.5 font-medium">{o.product}</td>
                      <td className="py-2.5 text-right font-semibold">¥{o.amount}</td>
                      <td className="py-2.5 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          o.status === "paid" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                          o.status === "pending" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                          "bg-red-50 dark:bg-red-900/20 text-red-500"
                        }`}>
                          {o.status === "paid" ? (locale === "zh" ? "已支付" : "Paid") :
                           o.status === "pending" ? (locale === "zh" ? "待支付" : "Pending") :
                           (locale === "zh" ? "退款" : "Refund")}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-xs text-muted-foreground">{o.time}</td>
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
