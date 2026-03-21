"use client";

import { motion } from "framer-motion";
import { Building2, Users, Megaphone, ArrowRight, Globe, BarChart3, Shield, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const solutions = [
  {
    id: "toc",
    icon: Users,
    color: "emerald",
    title: "ToC · 个人旅客",
    titleEn: "ToC · Travelers",
    desc: "面向个人旅客的AI智能旅行助手，提供行程规划、村落发现、实景导航和数字人伴游服务。",
    descEn: "AI travel assistant for individual travelers with trip planning, village discovery, live map navigation, and digital guide.",
    features: [
      { text: "AI行程智能规划", textEn: "AI Trip Planning" },
      { text: "村落发现引擎", textEn: "Village Discovery Engine" },
      { text: "实景地图导航", textEn: "Live Map Navigation" },
      { text: "数字人文化讲解", textEn: "AI Cultural Guide" },
    ],
    cta: "立即体验",
    ctaEn: "Start Exploring",
    href: "/planner",
  },
  {
    id: "tob",
    icon: Building2,
    color: "sky",
    title: "ToB · 文旅企业",
    titleEn: "ToB · Tourism Business",
    desc: "为旅行社、酒店、景区提供数字化解决方案，包含智能推荐引擎、数据分析看板和API接入服务。",
    descEn: "Digital solutions for travel agencies, hotels, and scenic spots with recommendation engine, analytics dashboard, and API access.",
    features: [
      { text: "景区智能管理后台", textEn: "Smart Scenic Management" },
      { text: "游客数据分析看板", textEn: "Visitor Analytics Dashboard" },
      { text: "推荐引擎API接入", textEn: "Recommendation Engine API" },
      { text: "CBT社区受益报告", textEn: "CBT Community Reports" },
    ],
    cta: "商务合作",
    ctaEn: "Contact Sales",
    href: "/pricing",
  },
  {
    id: "buc",
    icon: Megaphone,
    color: "violet",
    title: "BUC · 品牌推广",
    titleEn: "BUC · Brand & Growth",
    desc: "提供文旅品牌推广、内容营销、KOL合作和社区运营方案，助力乡村旅游品牌数字化增长。",
    descEn: "Tourism brand promotion, content marketing, KOL collaboration, and community operations for digital growth.",
    features: [
      { text: "文旅品牌策划推广", textEn: "Tourism Brand Marketing" },
      { text: "KOL/达人合作矩阵", textEn: "KOL Collaboration Matrix" },
      { text: "社区UGC内容运营", textEn: "Community UGC Operations" },
      { text: "精准营销数据投放", textEn: "Precision Ad Targeting" },
    ],
    cta: "合作咨询",
    ctaEn: "Learn More",
    href: "/forum",
  },
];

const colorMap: Record<string, Record<string, string>> = {
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600", border: "border-emerald-200 dark:border-emerald-800", btn: "bg-emerald-600 hover:bg-emerald-700", icon: "bg-emerald-100 dark:bg-emerald-900/30" },
  sky: { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-600", border: "border-sky-200 dark:border-sky-800", btn: "bg-sky-500 hover:bg-sky-600", icon: "bg-sky-100 dark:bg-sky-900/30" },
  violet: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600", border: "border-violet-200 dark:border-violet-800", btn: "bg-violet-600 hover:bg-violet-700", icon: "bg-violet-100 dark:bg-violet-900/30" },
};

const stats = [
  { icon: Globe, value: "5+", label: "覆盖村落", labelEn: "Villages Covered" },
  { icon: BarChart3, value: "98%", label: "用户满意度", labelEn: "Satisfaction" },
  { icon: Shield, value: "100%", label: "数据安全", labelEn: "Data Security" },
  { icon: TrendingUp, value: "3x", label: "转化提升", labelEn: "Conversion Boost" },
];

export default function BusinessSolutions() {
  const { locale } = useI18n();

  return (
    <section className="py-16 px-4" id="solutions">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-4">
            <Target className="h-3 w-3" />
            {locale === "zh" ? "多端解决方案" : "Multi-Platform Solutions"}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            {locale === "zh" ? "ToC · ToB · BUC 全链路覆盖" : "ToC · ToB · BUC Full Coverage"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {locale === "zh"
              ? "从个人旅客到文旅企业、从品牌推广到社区运营，提供全方位数字化旅游解决方案"
              : "From individual travelers to tourism businesses, from brand promotion to community operations"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-12">
          {solutions.map((s, idx) => {
            const c = colorMap[s.color];
            return (
              <motion.div
                key={s.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group"
              >
                <div className={`h-full rounded-2xl border ${c.border} ${c.bg} p-6 lg:p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col`}>
                  <div className={`inline-flex p-3 rounded-xl ${c.icon} ${c.text} mb-4 w-fit`}>
                    <s.icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-bold mb-2">{locale === "zh" ? s.title : s.titleEn}</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{locale === "zh" ? s.desc : s.descEn}</p>

                  <div className="flex-1 space-y-2 mb-6">
                    {s.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2 text-sm">
                        <Zap className={`h-3.5 w-3.5 ${c.text} shrink-0`} />
                        <span>{locale === "zh" ? f.text : f.textEn}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild className={`w-full h-11 rounded-xl ${c.btn} text-white font-medium`}>
                    <Link href={s.href}>
                      {locale === "zh" ? s.cta : s.ctaEn}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="rounded-xl border border-border bg-card p-5 text-center"
            >
              <s.icon className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{locale === "zh" ? s.label : s.labelEn}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
