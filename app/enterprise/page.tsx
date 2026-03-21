"use client";

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Building2, BarChart3, Cpu, Globe, Shield, ShieldAlert, Users, Zap, ArrowRight, ArrowLeft,
  Database, LineChart, Lock, Headphones, CheckCircle2, Layers, Brain,
  GitBranch, Workflow, TrendingUp, Award, Star, Play, ExternalLink,
  Server, Cloud, Smartphone, Monitor, ArrowUpRight, Target, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

// ── Data ──────────────────────────────────────────────
const heroMetrics = [
  { value: 380, suffix: "%", label: "客户营收增长", labelEn: "Revenue Growth" },
  { value: 12, suffix: "万+", label: "日均API调用", labelEn: "Daily API Calls" },
  { value: 99.9, suffix: "%", label: "系统可用性SLA", labelEn: "SLA Uptime" },
  { value: 50, suffix: "ms", label: "平均响应延迟", labelEn: "Avg Latency" },
];

const trustLogos = ["携程集团", "美团旅行", "飞猪旅行", "去哪儿网", "同程旅行", "马蜂窝", "途牛旅游", "驴妈妈"];

const platformModules = [
  {
    icon: BarChart3, title: "智能数据中台", titleEn: "Smart Data Platform",
    desc: "实时客流热力图 · 游客360°画像 · 消费行为链路 · 季节趋势预测 · 竞品对标分析",
    descEn: "Real-time heatmap · 360° visitor profiling · spending behavior chain · seasonal trend prediction · competitor benchmarking",
    color: "from-sky-500 to-blue-600", badge: "核心", badgeEn: "Core", href: "/enterprise/dashboard",
    metrics: [{ v: "2.8亿", l: "日处理数据点" }, { v: "<50ms", l: "查询响应" }, { v: "98.5%", l: "预测准确率" }],
  },
  {
    icon: Brain, title: "AI推荐引擎", titleEn: "AI Recommendation Engine",
    desc: "RAG知识库增强 · 协同过滤×内容推荐混合 · 向量检索 · 实时A/B测试 · 多臂老虎机优化",
    descEn: "RAG-enhanced · hybrid collaborative+content filtering · vector search · real-time A/B testing · multi-armed bandit",
    color: "from-violet-500 to-purple-600", badge: "AI驱动", badgeEn: "AI-Powered", href: "/enterprise/ai-engine",
    metrics: [{ v: "42%↑", l: "转化率提升" }, { v: "6维", l: "用户画像" }, { v: "实时", l: "模型更新" }],
  },
  {
    icon: Database, title: "景区运营中台", titleEn: "Scenic Operations Hub",
    desc: "电子票务 · 容量动态管控 · IoT设备巡检 · NPS服务评价 · 自动财务报表 · 供应链管理",
    descEn: "E-ticketing · dynamic capacity control · IoT equipment patrol · NPS service rating · auto financial reports · supply chain",
    color: "from-emerald-500 to-teal-600", badge: "一站式", badgeEn: "All-in-One", href: "/enterprise/operations",
    metrics: [{ v: "35%↓", l: "运营成本" }, { v: "4.8★", l: "平均NPS" }, { v: "自动化", l: "90%+流程" }],
  },
  {
    icon: LineChart, title: "CBT可持续旅游引擎", titleEn: "CBT Sustainability Engine",
    desc: "收入透明分配链 · 在地雇佣率追踪 · 青年回流指数 · ESG报告生成 · 碳足迹计算",
    descEn: "Transparent revenue chain · local employment tracking · youth return index · ESG reporting · carbon footprint calculator",
    color: "from-amber-500 to-orange-600", badge: "ESG", badgeEn: "ESG", href: "/enterprise/cbt",
    metrics: [{ v: "100%", l: "收入可追溯" }, { v: "22%↑", l: "在地雇佣" }, { v: "自动", l: "ESG报告" }],
  },
  {
    icon: Globe, title: "全域分发网络", titleEn: "Omni-Channel Distribution",
    desc: "OTA/飞猪/美团一键对接 · 小程序/H5/APP多端 · 统一库存管理 · 动态定价引擎 · 渠道ROI分析",
    descEn: "One-click OTA integration · mini-program/H5/APP · unified inventory · dynamic pricing engine · channel ROI analytics",
    color: "from-rose-500 to-pink-600", badge: "全域", badgeEn: "Omni", href: "/enterprise/distribution",
    metrics: [{ v: "15+", l: "渠道接入" }, { v: "实时", l: "库存同步" }, { v: "28%↑", l: "渠道ROI" }],
  },
  {
    icon: Shield, title: "企业安全与合规", titleEn: "Security & Compliance",
    desc: "AES-256加密 · RBAC权限 · SOC2审计 · GDPR/个保法合规 · 私有云部署 · 灾备双活",
    descEn: "AES-256 encryption · RBAC · SOC2 audit · GDPR compliance · private cloud deployment · disaster recovery",
    color: "from-slate-600 to-zinc-700", badge: "安全", badgeEn: "Secure", href: "/enterprise/security",
    metrics: [{ v: "0", l: "数据泄露" }, { v: "SOC2", l: "认证" }, { v: "双活", l: "灾备架构" }],
  },
  {
    icon: ShieldAlert, title: "AI内容审核过滤", titleEn: "AI Content Moderation",
    desc: "四层智能过滤 · 关键词/正则/民族文化敏感/垃圾特征检测 · 实时拦截 · 人工复审",
    descEn: "4-layer smart filtering · keyword/regex/ethnic sensitivity/spam detection · real-time blocking · manual review",
    color: "from-amber-500 to-red-600", badge: "AI审核", badgeEn: "AI Mod", href: "/enterprise/moderation",
    metrics: [{ v: "99.2%", l: "拦截准确率" }, { v: "4层", l: "过滤流水线" }, { v: "<100ms", l: "审核延迟" }],
  },
];

const techStack = [
  { icon: Cloud, name: "云原生架构", nameEn: "Cloud Native", desc: "K8s + Docker微服务" },
  { icon: Server, name: "高可用集群", nameEn: "HA Cluster", desc: "多AZ部署 · 99.9% SLA" },
  { icon: Cpu, name: "AI推理集群", nameEn: "AI Inference", desc: "GPU推理 · <50ms延迟" },
  { icon: Database, name: "数据湖仓", nameEn: "Data Lakehouse", desc: "实时+离线一体化" },
  { icon: Lock, name: "零信任安全", nameEn: "Zero Trust", desc: "mTLS · RBAC · 审计" },
  { icon: Workflow, name: "CI/CD流水线", nameEn: "CI/CD Pipeline", desc: "自动化部署 · 灰度发布" },
];

const caseStudies = [
  {
    company: "广东省某5A景区集团", companyEn: "Guangdong 5A Scenic Group",
    logo: "", industry: "景区运营", industryEn: "Scenic Operations",
    challenge: "日客流10万+，人工管理效率低，游客投诉率高，渠道分散。",
    challengeEn: "100K+ daily visitors, low manual efficiency, high complaint rate, scattered channels.",
    solution: "部署智能数据中台+AI推荐引擎+全域分发，实现数字化转型。",
    solutionEn: "Deployed Smart Data Platform + AI Engine + Omni-channel, achieving digital transformation.",
    results: [
      { metric: "营收增长", metricEn: "Revenue", value: "+380%", period: "12个月" },
      { metric: "投诉率", metricEn: "Complaints", value: "-67%", period: "6个月" },
      { metric: "复购率", metricEn: "Repeat Rate", value: "+125%", period: "12个月" },
    ],
  },
  {
    company: "华南某连锁旅行社", companyEn: "South China Travel Agency Chain",
    logo: "✈️", industry: "旅行社", industryEn: "Travel Agency",
    challenge: "30+门店数据割裂，产品上线慢，无法精准获客。",
    challengeEn: "30+ stores data silos, slow product launches, unable to acquire customers precisely.",
    solution: "接入推荐引擎API+CBT平台，实现精准营销和可持续旅游认证。",
    solutionEn: "Integrated Recommendation API + CBT Platform for precision marketing and sustainable tourism certification.",
    results: [
      { metric: "获客成本", metricEn: "CAC", value: "-52%", period: "6个月" },
      { metric: "GMV", metricEn: "GMV", value: "+210%", period: "12个月" },
      { metric: "ESG评级", metricEn: "ESG Rating", value: "A级", period: "首年" },
    ],
  },
];

const comparisonFeatures = [
  { feature: "AI推荐引擎", featureEn: "AI Recommendation", us: true, a: false, b: "部分" },
  { feature: "RAG知识库增强", featureEn: "RAG Knowledge Base", us: true, a: false, b: false },
  { feature: "CBT可持续追踪", featureEn: "CBT Sustainability", us: true, a: false, b: false },
  { feature: "CPI文化保护指数", featureEn: "CPI Cultural Index", us: true, a: false, b: false },
  { feature: "实时容量管控", featureEn: "Real-time Capacity", us: true, a: true, b: true },
  { feature: "多渠道分发", featureEn: "Multi-Channel", us: true, a: true, b: "部分" },
  { feature: "动态定价引擎", featureEn: "Dynamic Pricing", us: true, a: "部分", b: false },
  { feature: "ESG报告生成", featureEn: "ESG Reporting", us: true, a: false, b: false },
  { feature: "私有化部署", featureEn: "Private Deploy", us: true, a: true, b: false },
  { feature: "API开放平台", featureEn: "Open API Platform", us: true, a: "部分", b: "部分" },
];

const plans = [
  {
    name: "成长版", nameEn: "Growth", price: "¥2,999", priceEn: "$399", period: "/月", periodEn: "/mo",
    desc: "中小型景区/旅行社数字化起步", descEn: "SMB tourism digitalization starter",
    features: ["5个管理员", "基础数据看板", "API 1,000次/天", "3个渠道接入", "邮件+工单支持", "标准SSL加密"],
  },
  {
    name: "专业版", nameEn: "Professional", price: "¥9,999", priceEn: "$1,299", period: "/月", periodEn: "/mo",
    desc: "中大型企业全链路数字化", descEn: "Mid-large enterprise full-stack digitalization",
    popular: true,
    features: ["20个管理员", "全量数据看板+AI洞察", "API 50,000次/天", "15+渠道接入", "AI推荐引擎", "CBT报告导出", "专属客户经理", "7×12小时支持", "SOC2合规报告"],
  },
  {
    name: "旗舰版", nameEn: "Flagship", price: "定制", priceEn: "Custom", period: "", periodEn: "",
    desc: "集团级私有化部署方案", descEn: "Group-level private deployment",
    features: ["无限管理员", "私有云/混合云部署", "API无限制", "全渠道+定制集成", "AI推荐+动态定价", "ESG全套报告", "SLA 99.9%保障", "7×24专属团队", "灾备双活架构", "源码交付(可选)"],
  },
];

const testimonials = [
  { name: "张总", role: "某5A景区CEO", avatar: "张", quote: "部署智游清远企业版后，我们的数字化运营效率提升了3倍，游客满意度从82%提升到96%。这是我见过的最懂文旅行业的技术团队。", quoteEn: "After deploying SmartTravel Enterprise, our operational efficiency tripled and visitor satisfaction rose from 82% to 96%." },
  { name: "李经理", role: "华南旅行社运营总监", avatar: "李", quote: "AI推荐引擎让我们的获客成本降低了52%，CBT报告帮我们拿到了行业首个ESG A级认证。ROI远超预期。", quoteEn: "The AI engine cut our acquisition cost by 52%, and the CBT report helped us achieve the industry's first ESG A-rating." },
  { name: "王主任", role: "某市文旅局数据处", avatar: "王", quote: "政企联动方案让我们实现了从数据采集到政策评估的全链路闭环，为乡村振兴决策提供了强有力的数据支撑。", quoteEn: "The gov-enterprise solution enabled a full-chain closed loop from data collection to policy assessment." },
];

// ── Component ─────────────────────────────────────────
export default function EnterprisePage() {
  const { locale } = useI18n();
  const [activeCase, setActiveCase] = useState(0);

  return (
    <main className="flex flex-col min-h-dvh">
      {/* ═══ HERO ═══ */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-sky-50 via-background to-indigo-50/30 dark:from-sky-950/20 dark:via-background dark:to-indigo-950/10 pointer-events-none" />
        {/* Animated grid background */}
        <div className="bg-grid-pattern absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}</Link>
          </Button>
          <div className="text-center mb-12">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6 border border-sky-200 dark:border-sky-800">
                <Rocket className="h-3.5 w-3.5" />
                {locale === "zh" ? "Enterprise Edition · 已服务 200+ 文旅企业" : "Enterprise Edition · Serving 200+ Tourism Businesses"}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                <span className="bg-linear-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {locale === "zh" ? "AI驱动的文旅" : "AI-Powered Tourism"}
                </span>
                <br />
                <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {locale === "zh" ? "数字化转型操作系统" : "Digital Transformation OS"}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                {locale === "zh"
                  ? "为景区集团、旅行社、酒店和文旅投资机构提供从数据中台、AI推荐引擎到ESG可持续追踪的全栈解决方案 — 让每一次文旅投资都可量化、可追溯、可复制"
                  : "Full-stack solution from data platform, AI recommendation engine to ESG sustainability tracking for scenic groups, travel agencies, hotels, and tourism investors — making every investment quantifiable, traceable, and replicable"}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white h-12 px-7 rounded-xl text-base shadow-lg shadow-sky-600/20" asChild>
                  <Link href="/enterprise/dashboard">
                    <Play className="h-4 w-4 mr-2" />
                    {locale === "zh" ? "体验数据看板 Demo" : "Try Dashboard Demo"}
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 px-7 rounded-xl text-base" asChild>
                  <a href="#enterprise-pricing">{locale === "zh" ? "查看企业方案" : "View Enterprise Plans"}</a>
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Hero Metrics */}
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {heroMetrics.map((m, i) => (
              <div key={m.label} className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
                <div className="text-2xl md:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                  <NumberFlow value={m.value} format={{ maximumFractionDigits: m.value % 1 === 0 ? 0 : 1 }} />{m.suffix}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{locale === "zh" ? m.label : m.labelEn}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section className="py-8 px-4 border-y border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-center text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            {locale === "zh" ? "深受行业领先企业信赖" : "Trusted by Industry Leaders"}
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap opacity-50">
            {trustLogos.map((name) => (
              <span key={name} className="text-sm font-bold text-muted-foreground whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM MODULES ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 mb-3">
              <Layers className="h-3.5 w-3.5" />{locale === "zh" ? "六大核心平台模块" : "SIX CORE PLATFORM MODULES"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "全栈文旅数字化操作系统" : "Full-Stack Tourism Digital OS"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{locale === "zh" ? "从数据采集、AI推荐、运营管理到ESG合规的端到端解决方案，覆盖文旅企业全生命周期" : "End-to-end solution from data ingestion, AI recommendation, operations management to ESG compliance"}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformModules.map((m, idx) => (
              <motion.div key={m.title} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}>
                <Link href={m.href} className="group block h-full rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-linear-to-br ${m.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                      {locale === "zh" ? m.badge : m.badgeEn}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{locale === "zh" ? m.title : m.titleEn}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{locale === "zh" ? m.desc : m.descEn}</p>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                    {m.metrics.map((mt) => (
                      <div key={mt.l} className="text-center">
                        <div className="text-sm font-bold text-sky-600 dark:text-sky-400">{mt.v}</div>
                        <div className="text-[10px] text-muted-foreground">{mt.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-sky-600">{locale === "zh" ? "进入模块" : "Enter Module"}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-sky-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECH ARCHITECTURE ═══ */}
      <section className="py-20 px-4 bg-linear-to-b from-muted/30 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 mb-3">
              <GitBranch className="h-3.5 w-3.5" />{locale === "zh" ? "技术架构" : "TECH ARCHITECTURE"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "生产级云原生架构" : "Production-Grade Cloud Native Architecture"}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((t, idx) => (
              <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}>
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800 transition-all">
                  <t.icon className="h-6 w-6 text-sky-600 mb-2" />
                  <h4 className="text-xs font-bold mb-1">{locale === "zh" ? t.name : t.nameEn}</h4>
                  <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Architecture Diagram */}
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="mt-8 p-6 rounded-2xl border border-border bg-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
                <Monitor className="h-4 w-4 mx-auto text-sky-600 mb-1" />
                <div className="font-bold">{locale === "zh" ? "前端接入层" : "Frontend Layer"}</div>
                <div className="text-muted-foreground mt-1">Web · 小程序 · APP · H5</div>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800">
                <Cpu className="h-4 w-4 mx-auto text-violet-600 mb-1" />
                <div className="font-bold">{locale === "zh" ? "AI推理层" : "AI Inference Layer"}</div>
                <div className="text-muted-foreground mt-1">推荐 · NLP · 视觉 · 预测</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                <Server className="h-4 w-4 mx-auto text-emerald-600 mb-1" />
                <div className="font-bold">{locale === "zh" ? "业务微服务层" : "Microservices Layer"}</div>
                <div className="text-muted-foreground mt-1">票务 · 订单 · 用户 · 分销</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <Database className="h-4 w-4 mx-auto text-amber-600 mb-1" />
                <div className="font-bold">{locale === "zh" ? "数据湖仓层" : "Data Lakehouse Layer"}</div>
                <div className="text-muted-foreground mt-1">实时流 · 离线仓 · 向量库</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CASE STUDIES ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 mb-3">
              <Award className="h-3.5 w-3.5" />{locale === "zh" ? "客户成功案例" : "CUSTOMER SUCCESS STORIES"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "用数据说话的客户成果" : "Data-Driven Customer Results"}</h2>
          </motion.div>
          <div className="flex gap-3 justify-center mb-8">
            {caseStudies.map((c, i) => (
              <button key={i} onClick={() => setActiveCase(i)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCase === i ? "bg-sky-600 text-white shadow-lg" : "bg-muted hover:bg-muted/80"}`}>
                {c.logo} {locale === "zh" ? c.company : c.companyEn}
              </button>
            ))}
          </div>
          <motion.div key={activeCase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="text-xs font-semibold text-sky-600 bg-sky-50 dark:bg-sky-900/20 px-2.5 py-1 rounded-full">
                  {locale === "zh" ? caseStudies[activeCase].industry : caseStudies[activeCase].industryEn}
                </span>
                <h3 className="text-xl font-bold mt-3 mb-4">{locale === "zh" ? caseStudies[activeCase].company : caseStudies[activeCase].companyEn}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-red-500 mb-1">{locale === "zh" ? "挑战" : "Challenge"}</div>
                    <p className="text-muted-foreground">{locale === "zh" ? caseStudies[activeCase].challenge : caseStudies[activeCase].challengeEn}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-600 mb-1">{locale === "zh" ? "方案" : "Solution"}</div>
                    <p className="text-muted-foreground">{locale === "zh" ? caseStudies[activeCase].solution : caseStudies[activeCase].solutionEn}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-3">
                  {caseStudies[activeCase].results.map((r) => (
                    <div key={r.metric} className="text-center p-4 rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/30">
                      <div className="text-2xl font-extrabold text-sky-600">{r.value}</div>
                      <div className="text-xs font-semibold mt-1">{locale === "zh" ? r.metric : r.metricEn}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{r.period}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ COMPETITOR COMPARISON ═══ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 mb-3">
              <Target className="h-3.5 w-3.5" />{locale === "zh" ? "竞品对比" : "COMPETITIVE COMPARISON"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "为什么选择智游清远" : "Why SmartTravel QY"}</h2>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-semibold">{locale === "zh" ? "功能" : "Feature"}</th>
                    <th className="text-center p-3 font-bold text-sky-600">{locale === "zh" ? "智游清远" : "SmartTravel"}</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">{locale === "zh" ? "竞品A" : "Comp A"}</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">{locale === "zh" ? "竞品B" : "Comp B"}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((f, i) => (
                    <tr key={f.feature} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-muted/10" : ""}`}>
                      <td className="p-3 font-medium">{locale === "zh" ? f.feature : f.featureEn}</td>
                      <td className="p-3 text-center"><CheckCircle2 className="h-4 w-4 text-sky-600 mx-auto" /></td>
                      <td className="p-3 text-center text-xs text-muted-foreground">{f.a === true ? "✓" : f.a === false ? "✗" : f.a}</td>
                      <td className="p-3 text-center text-xs text-muted-foreground">{f.b === true ? "✓" : f.b === false ? "✗" : f.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "客户怎么说" : "What Customers Say"}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, idx) => (
              <motion.div key={t.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <div className="h-full rounded-2xl border border-border bg-card p-6 flex flex-col">
                  <div className="flex items-center gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">&ldquo;{locale === "zh" ? t.quote : t.quoteEn}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                    <span className="text-2xl">{t.avatar}</span>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="enterprise-pricing" className="py-20 px-4 bg-muted/30 scroll-mt-8">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "灵活的企业订阅方案" : "Flexible Enterprise Plans"}</h2>
            <p className="text-muted-foreground">{locale === "zh" ? "按需选择，随时升级，无隐藏费用" : "Choose as needed, upgrade anytime, no hidden fees"}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan, idx) => (
              <motion.div key={plan.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <div className={`h-full rounded-2xl border p-6 flex flex-col ${plan.popular ? "border-sky-500 bg-linear-to-b from-sky-50/80 to-card dark:from-sky-900/20 dark:to-card shadow-xl ring-2 ring-sky-500/20 scale-[1.02]" : "border-border bg-card"}`}>
                  {plan.popular && <span className="text-[10px] font-bold text-sky-600 bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded-full self-start mb-2">{locale === "zh" ? "最受欢迎" : "Most Popular"}</span>}
                  <h3 className="text-lg font-bold">{locale === "zh" ? plan.name : plan.nameEn}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{locale === "zh" ? plan.desc : plan.descEn}</p>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-extrabold">{locale === "zh" ? plan.price : plan.priceEn}</span>
                    <span className="text-sm text-muted-foreground">{locale === "zh" ? plan.period : plan.periodEn}</span>
                  </div>
                  <div className="flex-1 space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className={plan.popular ? "bg-sky-600 hover:bg-sky-700 text-white shadow-lg" : ""} variant={plan.popular ? "default" : "outline"}>
                    {locale === "zh" ? (plan.popular ? "立即开始" : "联系销售") : (plan.popular ? "Get Started" : "Contact Sales")}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="rounded-3xl bg-linear-to-br from-sky-600 to-indigo-700 p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="bg-dot-pattern absolute inset-0 opacity-10" />
              <div className="relative">
                <Headphones className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{locale === "zh" ? "准备好开始数字化转型了吗？" : "Ready to Start Your Digital Transformation?"}</h2>
                <p className="text-sky-100 mb-8 max-w-xl mx-auto">{locale === "zh" ? "预约30分钟免费咨询，我们的行业专家将为您量身定制解决方案" : "Book a free 30-min consultation. Our industry experts will tailor a solution for you"}</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button className="bg-white text-sky-700 hover:bg-sky-50 h-12 px-8 rounded-xl text-base font-bold shadow-lg" asChild>
                    <a href="#enterprise-pricing">{locale === "zh" ? "查看企业方案" : "View Enterprise Plans"}</a>
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl text-base" asChild>
                    <Link href="/enterprise/dashboard">{locale === "zh" ? "体验Demo" : "Try Demo"}</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-sky-200">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "免费试用14天" : "14-day free trial"}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "无需信用卡" : "No credit card"}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "随时取消" : "Cancel anytime"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cross-links */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href="/government">{locale === "zh" ? "了解政府版 →" : "Government Edition →"}</Link>
            </Button>
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href="/">{locale === "zh" ? "了解个人版 →" : "Personal Edition →"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
