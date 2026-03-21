"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Smartphone, Monitor, ShoppingBag, TrendingUp,
  ArrowUpRight, Package, DollarSign, BarChart3, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const channels = [
  { name: "携程旅行", type: "OTA", orders: 1245, revenue: 186400, stock: 92, status: "active", trend: "+18%" },
  { name: "美团旅行", type: "OTA", orders: 982, revenue: 142800, stock: 88, status: "active", trend: "+22%" },
  { name: "飞猪旅行", type: "OTA", orders: 756, revenue: 98600, stock: 95, status: "active", trend: "+12%" },
  { name: "微信小程序", type: "自有", orders: 2134, revenue: 268500, stock: 100, status: "active", trend: "+35%" },
  { name: "官方APP", type: "自有", orders: 892, revenue: 125800, stock: 100, status: "active", trend: "+28%" },
  { name: "抖音直播", type: "新媒体", orders: 456, revenue: 68200, stock: 78, status: "active", trend: "+45%" },
  { name: "小红书", type: "新媒体", orders: 234, revenue: 32400, stock: 85, status: "active", trend: "+52%" },
  { name: "官方H5", type: "自有", orders: 567, revenue: 78600, stock: 100, status: "active", trend: "+15%" },
];

const products = [
  { name: "峰林小镇+温泉2日游", total: 500, sold: 412, price: 598, channels: 6 },
  { name: "千年瑶寨文化深度体验", total: 300, sold: 256, price: 298, channels: 5 },
  { name: "积庆里采茶+围龙屋", total: 200, sold: 148, price: 168, channels: 4 },
  { name: "清远5村联游3日套餐", total: 150, sold: 98, price: 1288, channels: 7 },
];

const pricingRules = [
  { name: "节假日溢价", condition: "法定节假日", adjustment: "+30%", status: "active" },
  { name: "早鸟优惠", condition: "提前14天预订", adjustment: "-15%", status: "active" },
  { name: "尾单促销", condition: "出发前3天余量>50%", adjustment: "-25%", status: "active" },
  { name: "团购阶梯价", condition: "≥10人成团", adjustment: "-20%", status: "active" },
];

export default function DistributionPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"channels" | "inventory" | "pricing">("channels");

  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = channels.reduce((s, c) => s + c.orders, 0);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-600" />
              {locale === "zh" ? "全域分发网络" : "Omni-Channel Distribution"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "渠道管理 · 库存同步 · 动态定价" : "Channel Mgmt · Inventory Sync · Dynamic Pricing"}</p>
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
              { icon: ShoppingBag, label: "总订单", labelEn: "Total Orders", value: totalOrders.toLocaleString(), color: "text-sky-600" },
              { icon: DollarSign, label: "总收入", labelEn: "Total Revenue", value: `¥${(totalRevenue / 10000).toFixed(1)}万`, color: "text-emerald-600" },
              { icon: Globe, label: "活跃渠道", labelEn: "Active Channels", value: `${channels.length}个`, color: "text-rose-600" },
              { icon: Package, label: "库存同步率", labelEn: "Sync Rate", value: "99.8%", color: "text-violet-600" },
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

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            {([
              { id: "channels" as const, label: "渠道管理", labelEn: "Channels", icon: Globe },
              { id: "inventory" as const, label: "统一库存", labelEn: "Inventory", icon: Package },
              { id: "pricing" as const, label: "动态定价", labelEn: "Dynamic Pricing", icon: DollarSign },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {tab === "channels" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="text-left py-2">{locale === "zh" ? "渠道" : "Channel"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "类型" : "Type"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "订单" : "Orders"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "收入" : "Revenue"}</th>
                      <th className="text-center py-2">{locale === "zh" ? "库存同步" : "Sync"}</th>
                      <th className="text-right py-2">{locale === "zh" ? "增长" : "Growth"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((c) => (
                      <tr key={c.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-medium">{c.name}</td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.type === "OTA" ? "bg-sky-100 dark:bg-sky-900/20 text-sky-600" : c.type === "自有" ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600" : "bg-rose-100 dark:bg-rose-900/20 text-rose-600"}`}>{c.type}</span>
                        </td>
                        <td className="py-2.5 text-right">{c.orders.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-semibold">¥{(c.revenue / 10000).toFixed(1)}万</td>
                        <td className="py-2.5 text-center text-xs">{c.stock}%</td>
                        <td className="py-2.5 text-right text-xs text-emerald-600 font-medium">{c.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab === "inventory" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-4">
                {products.map((p) => (
                  <div key={p.name} className="p-4 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold">{p.name}</h4>
                      <span className="text-xs text-muted-foreground">¥{p.price} · {p.channels}{locale === "zh" ? "渠道" : " channels"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(p.sold / p.total) * 100}%` }} transition={{ delay: 0.3, duration: 0.8 }} className={`h-full rounded-full ${(p.sold / p.total) > 0.8 ? "bg-red-500" : (p.sold / p.total) > 0.6 ? "bg-amber-500" : "bg-emerald-500"}`} />
                      </div>
                      <span className="text-xs font-semibold">{p.sold}/{p.total}</span>
                      <span className="text-[10px] text-muted-foreground">{locale === "zh" ? `余${p.total - p.sold}` : `${p.total - p.sold} left`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "pricing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {pricingRules.map((r) => (
                  <div key={r.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div>
                      <h4 className="text-sm font-bold">{r.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{locale === "zh" ? "触发条件" : "Trigger"}: {r.condition}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${r.adjustment.startsWith("+") ? "text-red-500" : "text-emerald-600"}`}>{r.adjustment}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-medium">{locale === "zh" ? "启用" : "Active"}</span>
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
