"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Home, Heart, ArrowUpRight, Coins, GraduationCap, ShieldCheck, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";

const cbtData = [
  {
    village: "峰林小镇",
    villageEn: "Fenglin Town",
    totalIncome: "¥128.5万",
    localHire: 87,
    youthReturn: 12,
    satisfaction: 94,
    breakdown: [
      { label: "住宿收入", labelEn: "Accommodation", pct: 35, amount: "¥44.9万" },
      { label: "餐饮收入", labelEn: "Dining", pct: 28, amount: "¥36.0万" },
      { label: "体验活动", labelEn: "Activities", pct: 22, amount: "¥28.3万" },
      { label: "农特产品", labelEn: "Products", pct: 15, amount: "¥19.3万" },
    ],
  },
  {
    village: "千年瑶寨",
    villageEn: "Yao Village",
    totalIncome: "¥96.2万",
    localHire: 92,
    youthReturn: 18,
    satisfaction: 96,
    breakdown: [
      { label: "门票分成", labelEn: "Tickets", pct: 30, amount: "¥28.9万" },
      { label: "文化体验", labelEn: "Culture", pct: 32, amount: "¥30.8万" },
      { label: "餐饮收入", labelEn: "Dining", pct: 23, amount: "¥22.1万" },
      { label: "手工艺品", labelEn: "Crafts", pct: 15, amount: "¥14.4万" },
    ],
  },
  {
    village: "上岳古村",
    villageEn: "Shangyue",
    totalIncome: "¥58.7万",
    localHire: 78,
    youthReturn: 8,
    satisfaction: 91,
    breakdown: [
      { label: "参观收入", labelEn: "Tourism", pct: 40, amount: "¥23.5万" },
      { label: "餐饮收入", labelEn: "Dining", pct: 25, amount: "¥14.7万" },
      { label: "研学活动", labelEn: "Education", pct: 20, amount: "¥11.7万" },
      { label: "文创产品", labelEn: "Souvenirs", pct: 15, amount: "¥8.8万" },
    ],
  },
  {
    village: "油岭瑶寨",
    villageEn: "Youling",
    totalIncome: "¥42.3万",
    localHire: 95,
    youthReturn: 6,
    satisfaction: 93,
    breakdown: [
      { label: "文化演出", labelEn: "Shows", pct: 38, amount: "¥16.1万" },
      { label: "手工体验", labelEn: "Crafts", pct: 27, amount: "¥11.4万" },
      { label: "餐饮住宿", labelEn: "Hospitality", pct: 22, amount: "¥9.3万" },
      { label: "导览服务", labelEn: "Guides", pct: 13, amount: "¥5.5万" },
    ],
  },
  {
    village: "积庆里",
    villageEn: "Jiqingli",
    totalIncome: "¥75.8万",
    localHire: 82,
    youthReturn: 10,
    satisfaction: 90,
    breakdown: [
      { label: "茶叶销售", labelEn: "Tea Sales", pct: 42, amount: "¥31.8万" },
      { label: "茶园体验", labelEn: "Tea Tours", pct: 25, amount: "¥19.0万" },
      { label: "餐饮住宿", labelEn: "Hospitality", pct: 20, amount: "¥15.2万" },
      { label: "文创产品", labelEn: "Souvenirs", pct: 13, amount: "¥9.9万" },
    ],
  },
];

const impactMetrics = [
  { icon: Coins, value: "¥401.5万", label: "总旅游收入", labelEn: "Total Revenue", color: "emerald" },
  { icon: Users, value: "86.8%", label: "平均在地雇佣率", labelEn: "Avg Local Hire", color: "sky" },
  { icon: GraduationCap, value: "54人", label: "青年回流人数", labelEn: "Youth Returnees", color: "amber" },
  { icon: Heart, value: "92.8%", label: "平均满意度", labelEn: "Avg Satisfaction", color: "rose" },
];

export default function CommunityPage() {
  const { locale } = useI18n();
  const [selectedVillage, setSelectedVillage] = useState(0);
  const current = cbtData[selectedVillage];

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={locale === "zh" ? "社区共建共享" : "Community Co-build"}
        description={locale === "zh" ? "CBT社区受益追踪，让旅游收入真正惠及每一位村民" : "CBT tracking ensures tourism income benefits every villager"}
        gradient="from-violet-500 to-purple-500"
      />

      <section className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {impactMetrics.map((m, idx) => (
              <motion.div
                key={m.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 text-center"
              >
                <div className={`inline-flex p-2.5 rounded-xl mb-3 ${
                  m.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" :
                  m.color === "sky" ? "bg-sky-50 dark:bg-sky-900/30 text-sky-600" :
                  m.color === "amber" ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600" :
                  "bg-rose-50 dark:bg-rose-900/30 text-rose-600"
                }`}>
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{locale === "zh" ? m.label : m.labelEn}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex border-b border-border overflow-x-auto">
              {cbtData.map((v, idx) => (
                <button
                  key={v.village}
                  onClick={() => setSelectedVillage(idx)}
                  className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                    selectedVillage === idx
                      ? "border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/20"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card"
                  }`}
                >
                  {locale === "zh" ? v.village : v.villageEn}
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold mb-1">
                    {locale === "zh" ? current.village : current.villageEn}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {locale === "zh" ? "收入分配透明追踪 · CBT认证" : "Transparent income distribution · CBT certified"}
                  </p>

                  <div className="space-y-3">
                    {current.breakdown.map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{locale === "zh" ? item.label : item.labelEn}</span>
                          <span className="font-medium">{item.amount} ({item.pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="font-medium">
                        {locale === "zh" ? "CBT认证 · 所有收入数据均已上链存证" : "CBT Certified · All income data on-chain verified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {locale === "zh" ? "总旅游收入" : "Total Revenue"}
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">{current.totalIncome}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +23% YoY
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {locale === "zh" ? "在地雇佣率" : "Local Hire Rate"}
                    </div>
                    <div className="text-2xl font-bold text-sky-600">{current.localHire}%</div>
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-sky-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${current.localHire}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {locale === "zh" ? "青年回流" : "Youth Return"}
                    </div>
                    <div className="text-2xl font-bold text-amber-600">{current.youthReturn}{locale === "zh" ? "人" : ""}</div>
                    <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                      <GraduationCap className="h-3 w-3" />
                      {locale === "zh" ? "本年度新增" : "This year"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {locale === "zh" ? "村民满意度" : "Satisfaction"}
                    </div>
                    <div className="text-2xl font-bold text-rose-600">{current.satisfaction}%</div>
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-rose-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${current.satisfaction}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-6 md:p-8 text-center"
          >
            <h3 className="text-xl font-bold mb-2">
              {locale === "zh" ? "我们的承诺" : "Our Commitment"}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              {locale === "zh"
                ? "智游清远致力于让每一笔旅游消费都能真正惠及当地社区。通过CBT社区受益追踪系统，确保收入透明分配，激励在地雇佣和青年回流，实现「旅游兴村」的乡村振兴目标。"
                : "SmartTravel Qingyuan is committed to ensuring every tourism dollar truly benefits local communities through our CBT tracking system."}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>{locale === "zh" ? "收入100%透明" : "100% Transparent"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-emerald-600" />
                <span>{locale === "zh" ? "优先在地雇佣" : "Local-first Hiring"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <span>{locale === "zh" ? "青年回流支持" : "Youth Return Support"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-emerald-600" />
                <span>{locale === "zh" ? "文化保护优先" : "Culture First"}</span>
              </div>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Link href="/forum">
                <MessageSquare className="h-4 w-4" />
                {locale === "zh" ? "前往旅行社区交流" : "Go to Community Forum"}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
