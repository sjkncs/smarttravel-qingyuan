"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark, BarChart3, MapPin, Shield, Users, TreePine, ArrowRight, ArrowLeft,
  FileText, Eye, TrendingUp, AlertTriangle, CheckCircle2, Headphones,
  Brain, Award, Layers, GitBranch, Workflow, Target, Play, Star,
  Fingerprint, Scale, BookOpen, GraduationCap, HeartHandshake, Siren,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import NumberFlow from "@number-flow/react";

// ── Data ──────────────────────────────────────────────
const heroMetrics = [
  { value: 28, suffix: "万+", label: "月均游客管理", labelEn: "Monthly Visitors Managed" },
  { value: 5, suffix: "", label: "接入村落", labelEn: "Connected Villages" },
  { value: 4, suffix: "项", label: "独创指数体系", labelEn: "Original Index Systems" },
  { value: 100, suffix: "%", label: "政策可追溯率", labelEn: "Policy Traceability" },
];

const govPartners = ["广东省文旅厅", "清远市文旅局", "连南县政府", "英德市政府", "清新区政府", "阳山县文旅局"];

const innovationIndices = [
  {
    name: "VSI", fullName: "村落安全指数", fullNameEn: "Village Safety Index",
    desc: "融合气象/客流/基建/舆情/应急5维度的实时安全评估体系，自适应权重，交叉验证",
    descEn: "5-dimensional real-time safety assessment: weather/crowd/infrastructure/sentiment/emergency with adaptive weights",
    color: "from-red-500 to-rose-600", score: 91.3,
    components: ["气象风险", "客流密度", "基建安全", "舆情监测", "应急能力"],
    componentsEn: ["Weather Risk", "Crowd Density", "Infrastructure", "Sentiment", "Emergency"],
  },
  {
    name: "CPI", fullName: "文化保护指数", fullNameEn: "Cultural Protection Index",
    desc: "非遗濒危度评估、传承人知识图谱、文化敏感区分级、游客承载力动态计算",
    descEn: "Intangible heritage risk assessment, inheritor knowledge graph, cultural sensitivity zoning, dynamic carrying capacity",
    color: "from-violet-500 to-purple-600", score: 85.8,
    components: ["非遗濒危", "传承人图谱", "文化敏感度", "承载力"],
    componentsEn: ["Heritage Risk", "Inheritor Graph", "Sensitivity", "Capacity"],
  },
  {
    name: "RAI", fullName: "乡村可达性指数", fullNameEn: "Rural Accessibility Index",
    desc: "交通可达性、通信信号覆盖、基础设施评估、无障碍设施四维综合评估",
    descEn: "Transport accessibility, signal coverage, infrastructure assessment, barrier-free facilities — 4D comprehensive evaluation",
    color: "from-sky-500 to-blue-600", score: 82.6,
    components: ["交通可达", "信号覆盖", "基建评估", "无障碍"],
    componentsEn: ["Transport", "Signal", "Infrastructure", "Barrier-free"],
  },
  {
    name: "CBT", fullName: "社区受益追踪", fullNameEn: "Community Benefit Tracking",
    desc: "收入分配透明链、在地雇佣率追踪、青年回流指数、碳足迹计算、ESG合规报告",
    descEn: "Transparent income distribution, local employment tracking, youth return index, carbon footprint, ESG compliance reports",
    color: "from-emerald-500 to-teal-600", score: 75.4,
    components: ["收入透明", "在地雇佣", "青年回流", "碳足迹", "ESG"],
    componentsEn: ["Revenue", "Local Jobs", "Youth Return", "Carbon", "ESG"],
  },
];

const platformModules = [
  {
    icon: BarChart3, title: "文旅大数据驾驶舱", titleEn: "Tourism Big Data Cockpit",
    desc: "全域旅游数据实时可视化 · 游客流量热力图 · 消费结构分析 · 满意度指标 · 趋势预测 · 一屏掌握全域态势",
    descEn: "Real-time tourism data visualization · visitor heatmap · spending analysis · satisfaction metrics · trend prediction",
    color: "from-violet-500 to-purple-600", badge: "核心", badgeEn: "Core", href: "/government/cockpit",
    metrics: [{ v: "28万+", l: "月管理游客" }, { v: "实时", l: "数据更新" }, { v: "98%", l: "覆盖率" }],
  },
  {
    icon: TreePine, title: "乡村振兴数字化平台", titleEn: "Rural Revitalization Platform",
    desc: "CBT社区受益追踪 · 青年回流指数 · 在地雇佣率 · 村集体收入透明化 · 产业发展监测 · 精准扶贫成效量化",
    descEn: "CBT tracking · youth return index · local employment · transparent income · industry monitoring · poverty alleviation KPIs",
    color: "from-emerald-500 to-teal-600", badge: "振兴", badgeEn: "Revital", href: "/government/revitalization",
    metrics: [{ v: "22%↑", l: "村民收入" }, { v: "35人", l: "青年回流" }, { v: "100%", l: "收入可追溯" }],
  },
  {
    icon: Shield, title: "文化遗产保护监测", titleEn: "Cultural Heritage Monitoring",
    desc: "CPI文化保护指数 · 非遗传承人图谱 · 文化敏感区预警 · 承载力管控 · 活态传承数字化 · 文化基因库",
    descEn: "CPI cultural index · intangible heritage mapping · sensitivity alerts · capacity control · living heritage digitization",
    color: "from-amber-500 to-orange-600", badge: "非遗", badgeEn: "Heritage", href: "/government/heritage",
    metrics: [{ v: "12项", l: "非遗监测" }, { v: "8位", l: "传承人追踪" }, { v: "实时", l: "预警" }],
  },
  {
    icon: Siren, title: "旅游安全应急指挥", titleEn: "Tourism Safety Command",
    desc: "VSI村落安全指数 · 气象预警联动 · 应急疏散路径规划 · A*最优路径 · 突发事件指挥 · 多部门协同",
    descEn: "VSI safety index · weather alert integration · A* optimal evacuation · incident command · multi-department coordination",
    color: "from-red-500 to-rose-600", badge: "应急", badgeEn: "Emergency", href: "/government/safety",
    metrics: [{ v: "<3min", l: "响应时间" }, { v: "A*", l: "路径算法" }, { v: "多部门", l: "联动" }],
  },
  {
    icon: Eye, title: "智慧监管与执法", titleEn: "Smart Supervision & Enforcement",
    desc: "景区经营合规监测 · AI价格监管 · 投诉NLP分析 · 服务质量评级 · 年度考核报告自动生成 · 执法闭环",
    descEn: "Business compliance · AI price regulation · NLP complaint analysis · service grading · auto annual reports · enforcement loop",
    color: "from-sky-500 to-blue-600", badge: "监管", badgeEn: "Supervise", href: "/government/supervision",
    metrics: [{ v: "AI", l: "合规检测" }, { v: "NLP", l: "投诉分析" }, { v: "自动", l: "考核报告" }],
  },
  {
    icon: FileText, title: "政策效果评估系统", titleEn: "Policy Impact Assessment",
    desc: "政策效果量化建模 · 资金使用全链路追踪 · A/B对照实验 · 项目绩效对比 · 决策支持报告 · 经验复制推广",
    descEn: "Policy impact modeling · full-chain fund tracking · A/B comparison · project performance · decision support · replication",
    color: "from-slate-600 to-zinc-700", badge: "评估", badgeEn: "Assess", href: "/government/policy",
    metrics: [{ v: "量化", l: "效果建模" }, { v: "全链路", l: "资金追踪" }, { v: "A/B", l: "对照实验" }],
  },
];

const successCases = [
  {
    region: "清远市连南县", regionEn: "Liannan County, Qingyuan",
    icon: "", type: "乡村振兴", typeEn: "Rural Revitalization",
    challenge: "千年瑶寨文化流失加速，年轻人外流，瑶族非遗传承人仅剩8位，游客量虽大但社区受益率低。",
    challengeEn: "Cultural heritage loss in Thousand-Year Yao Village, youth exodus, only 8 intangible heritage inheritors, low community benefit despite high tourist volume.",
    solution: "部署CPI文化保护监测+CBT社区受益追踪，建立非遗传承人数字档案，实现收入透明分配。",
    solutionEn: "Deployed CPI cultural monitoring + CBT benefit tracking, digitized inheritor archives, transparent income distribution.",
    results: [
      { metric: "CPI指数", metricEn: "CPI Score", value: "+18分", period: "12个月" },
      { metric: "青年回流", metricEn: "Youth Return", value: "+8人", period: "首年" },
      { metric: "社区收益", metricEn: "Community Revenue", value: "+156%", period: "12个月" },
      { metric: "非遗活动", metricEn: "Heritage Events", value: "+240%", period: "12个月" },
    ],
  },
  {
    region: "清远市英德市", regionEn: "Yingde City, Qingyuan",
    icon: "", type: "全域旅游", typeEn: "Global Tourism",
    challenge: "峰林小镇节假日客流突破承载力上限，安全隐患频发，缺乏科学的容量管控和应急指挥能力。",
    challengeEn: "Fenglin Town holiday crowds exceeded capacity, frequent safety incidents, lacking scientific capacity control and emergency command.",
    solution: "部署VSI安全指数+大数据驾驶舱+应急指挥系统，实现全域旅游创建指标数据化管理。",
    solutionEn: "Deployed VSI safety index + big data cockpit + emergency command, achieving data-driven global tourism management.",
    results: [
      { metric: "安全事故", metricEn: "Safety Incidents", value: "-83%", period: "6个月" },
      { metric: "VSI评分", metricEn: "VSI Score", value: "95分", period: "首年" },
      { metric: "游客满意度", metricEn: "Satisfaction", value: "+22%", period: "12个月" },
      { metric: "应急响应", metricEn: "Response Time", value: "<3min", period: "即时" },
    ],
  },
];

const implementationSteps = [
  { phase: "调研诊断", phaseEn: "Assessment", duration: "2周", icon: Target, desc: "现场调研、需求分析、数据资产盘点、现有系统对接评估", descEn: "On-site research, requirement analysis, data asset audit, system integration assessment" },
  { phase: "方案设计", phaseEn: "Design", duration: "2周", icon: FileText, desc: "定制化方案设计、技术架构规划、数据模型建立、安全合规方案", descEn: "Custom solution design, tech architecture, data modeling, security compliance plan" },
  { phase: "平台部署", phaseEn: "Deployment", duration: "4-8周", icon: Layers, desc: "系统部署、数据接入、指数模型训练、IoT设备联调、安全加固", descEn: "System deployment, data ingestion, index model training, IoT integration, security hardening" },
  { phase: "培训上线", phaseEn: "Launch", duration: "2周", icon: GraduationCap, desc: "管理员培训、操作手册交付、试运行验收、正式上线", descEn: "Admin training, manual delivery, trial run acceptance, official launch" },
  { phase: "持续运营", phaseEn: "Operations", duration: "长期", icon: HeartHandshake, desc: "7×24运维保障、季度优化迭代、年度政策效果评估报告", descEn: "24/7 operations, quarterly optimization, annual policy impact assessment" },
];

const complianceBadges = [
  { name: "等保三级", nameEn: "MLPS Level 3", desc: "信息安全等级保护", icon: Shield },
  { name: "国产化适配", nameEn: "Domestic Adaptation", desc: "信创生态兼容", icon: Fingerprint },
  { name: "数据合规", nameEn: "Data Compliance", desc: "个保法/数据安全法", icon: Scale },
  { name: "政务云部署", nameEn: "Gov Cloud Deploy", desc: "支持政务云/私有云", icon: BookOpen },
];

const expertTeam = [
  { name: "陈教授", nameEn: "Prof. Chen", role: "首席文旅顾问", roleEn: "Chief Tourism Advisor", avatar: "陈", credential: "中山大学旅游学院教授 · 文旅部智库专家" },
  { name: "李博士", nameEn: "Dr. Li", role: "AI算法负责人", roleEn: "AI Lead", avatar: "李", credential: "华南理工AI博士 · 前阿里达摩院研究员" },
  { name: "王主任", nameEn: "Dir. Wang", role: "政府事务总监", roleEn: "Gov Relations Director", avatar: "王", credential: "原广东省文旅厅数据处 · 15年政务经验" },
  { name: "赵工", nameEn: "Eng. Zhao", role: "非遗保护专家", roleEn: "Heritage Expert", avatar: "赵", credential: "国家级非遗评审专家 · 瑶族文化研究学者" },
];

// ── Component ─────────────────────────────────────────
export default function GovernmentPage() {
  const { locale } = useI18n();
  const [activeCase, setActiveCase] = useState(0);

  return (
    <main className="flex flex-col min-h-dvh">
      {/* ═══ HERO ═══ */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-50 via-background to-purple-50/30 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10 pointer-events-none" />
        <div className="bg-grid-pattern absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}</Link>
          </Button>
          <div className="text-center mb-12">
            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-6 border border-violet-200 dark:border-violet-800">
                <Landmark className="h-3.5 w-3.5" />
                {locale === "zh" ? "Government Edition · 服务清远5大核心村落" : "Government Edition · Serving 5 Core Qingyuan Villages"}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight">
                <span className="bg-linear-to-r from-violet-700 via-purple-600 to-indigo-600 dark:from-violet-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {locale === "zh" ? "数据驱动的" : "Data-Driven"}
                </span>
                <br />
                <span className="bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {locale === "zh" ? "智慧文旅治理与乡村振兴" : "Smart Tourism Governance"}
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
                {locale === "zh"
                  ? "首创VSI·CPI·RAI·CBT四大指数体系，为文旅局、乡村振兴办提供从数据驾驶舱、文化遗产保护到政策效果量化评估的全链路治理平台 — 让每一分财政投入都可量化、可追溯、可复制"
                  : "Pioneering VSI·CPI·RAI·CBT index systems, providing full-chain governance from data cockpit, heritage protection to quantitative policy assessment — making every fiscal investment measurable, traceable, and replicable"}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-7 rounded-xl text-base shadow-lg shadow-violet-600/20" asChild>
                  <Link href="/government/cockpit">
                    <Play className="h-4 w-4 mr-2" />
                    {locale === "zh" ? "体验驾驶舱 Demo" : "Try Cockpit Demo"}
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 px-7 rounded-xl text-base" asChild>
                  <a href="#gov-free-plan">{locale === "zh" ? "免费申请政府方案" : "Apply for Free Gov Plan"}</a>
                </Button>
              </div>
              <p className="text-sm text-violet-600 dark:text-violet-300 font-semibold mt-4">{locale === "zh" ? "✨ 政府版全部功能免费开放" : "✨ Government Edition — All features free"}</p>
            </motion.div>
          </div>

          {/* Hero Metrics */}
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {heroMetrics.map((m) => (
              <div key={m.label} className="text-center p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
                <div className="text-2xl md:text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                  <NumberFlow value={m.value} format={{ maximumFractionDigits: m.value % 1 === 0 ? 0 : 1 }} />{m.suffix}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{locale === "zh" ? m.label : m.labelEn}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ GOV TRUST BAR ═══ */}
      <section className="py-8 px-4 border-y border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs text-center text-muted-foreground mb-4 font-medium uppercase tracking-wider">
            {locale === "zh" ? "政府合作伙伴" : "Government Partners"}
          </p>
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap opacity-50">
            {govPartners.map((name) => (
              <span key={name} className="text-sm font-bold text-muted-foreground whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INNOVATION INDICES ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <Brain className="h-3.5 w-3.5" />{locale === "zh" ? "首创学术级指数体系" : "PIONEERING ACADEMIC-GRADE INDEX SYSTEMS"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "四大原创指数 · 行业首创" : "Four Original Indices · Industry First"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{locale === "zh" ? "区别于简单数据展示，我们首创VSI·CPI·RAI·CBT四大指数体系，实现从「看数据」到「治理决策」的跨越" : "Beyond simple data display — our pioneering index systems bridge the gap from 'viewing data' to 'governance decisions'"}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {innovationIndices.map((idx, i) => (
              <motion.div key={idx.name} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="group h-full rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-2xl font-extrabold bg-linear-to-r ${idx.color} bg-clip-text text-transparent`}>{idx.name}</span>
                      <h3 className="text-base font-bold mt-1">{locale === "zh" ? idx.fullName : idx.fullNameEn}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-violet-600">{idx.score}</div>
                      <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "当前均值" : "Current Avg"}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{locale === "zh" ? idx.desc : idx.descEn}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(locale === "zh" ? idx.components : idx.componentsEn).map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PLATFORM MODULES ═══ */}
      <section className="py-20 px-4 bg-linear-to-b from-muted/30 to-background">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <Layers className="h-3.5 w-3.5" />{locale === "zh" ? "六大治理平台模块" : "SIX GOVERNANCE PLATFORM MODULES"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "全链路智慧文旅治理体系" : "Full-Chain Smart Tourism Governance"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{locale === "zh" ? "数据驱动、科学决策、精准施策 — 覆盖文旅治理全生命周期" : "Data-driven, scientific, precise — covering the entire governance lifecycle"}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformModules.map((m, i) => (
              <motion.div key={m.title} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link href={m.href} className="group block h-full rounded-2xl border border-border bg-card p-6 hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-linear-to-br ${m.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <m.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                      {locale === "zh" ? m.badge : m.badgeEn}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{locale === "zh" ? m.title : m.titleEn}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{locale === "zh" ? m.desc : m.descEn}</p>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/50">
                    {m.metrics.map((mt) => (
                      <div key={mt.l} className="text-center">
                        <div className="text-sm font-bold text-violet-600 dark:text-violet-400">{mt.v}</div>
                        <div className="text-[10px] text-muted-foreground">{mt.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-violet-600">{locale === "zh" ? "进入模块" : "Enter Module"}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-violet-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SUCCESS CASES ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <Award className="h-3.5 w-3.5" />{locale === "zh" ? "政府成功案例" : "GOVERNMENT SUCCESS STORIES"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "用数据证明治理成效" : "Data-Proven Governance Results"}</h2>
          </motion.div>
          <div className="flex gap-3 justify-center mb-8">
            {successCases.map((c, i) => (
              <button key={i} onClick={() => setActiveCase(i)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCase === i ? "bg-violet-600 text-white shadow-lg" : "bg-muted hover:bg-muted/80"}`}>
                {c.icon} {locale === "zh" ? c.region : c.regionEn}
              </button>
            ))}
          </div>
          <motion.div key={activeCase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full">
                  {locale === "zh" ? successCases[activeCase].type : successCases[activeCase].typeEn}
                </span>
                <h3 className="text-xl font-bold mt-3 mb-4">{locale === "zh" ? successCases[activeCase].region : successCases[activeCase].regionEn}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-red-500 mb-1">{locale === "zh" ? "治理挑战" : "Challenge"}</div>
                    <p className="text-muted-foreground">{locale === "zh" ? successCases[activeCase].challenge : successCases[activeCase].challengeEn}</p>
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-600 mb-1">{locale === "zh" ? "治理方案" : "Solution"}</div>
                    <p className="text-muted-foreground">{locale === "zh" ? successCases[activeCase].solution : successCases[activeCase].solutionEn}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-3">
                  {successCases[activeCase].results.map((r) => (
                    <div key={r.metric} className="text-center p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30">
                      <div className="text-xl font-extrabold text-violet-600">{r.value}</div>
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

      {/* ═══ IMPLEMENTATION PATH ═══ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <Workflow className="h-3.5 w-3.5" />{locale === "zh" ? "实施路径" : "IMPLEMENTATION PATH"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "从调研到上线的全流程保障" : "Full-Process Assurance from Assessment to Launch"}</h2>
          </motion.div>
          <div className="relative">
            <div className="absolute left-[22px] top-8 bottom-8 w-px bg-violet-200 dark:bg-violet-800 hidden md:block" />
            <div className="space-y-4">
              {implementationSteps.map((s, i) => (
                <motion.div key={s.phase} initial={{ x: -20, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center">
                        <s.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{locale === "zh" ? s.phase : s.phaseEn}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600">{s.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{locale === "zh" ? s.desc : s.descEn}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ COMPLIANCE & CERTIFICATIONS ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "政务级安全与合规" : "Government-Grade Security & Compliance"}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {complianceBadges.map((b, i) => (
              <motion.div key={b.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-center p-5 rounded-2xl border border-border bg-card hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all">
                  <b.icon className="h-8 w-8 text-violet-600 mx-auto mb-3" />
                  <h4 className="text-sm font-bold mb-1">{locale === "zh" ? b.name : b.nameEn}</h4>
                  <p className="text-[10px] text-muted-foreground">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ EXPERT TEAM ═══ */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <GraduationCap className="h-3.5 w-3.5" />{locale === "zh" ? "专家顾问团队" : "EXPERT ADVISORY TEAM"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "行业顶尖的专家团队" : "Industry-Leading Expert Team"}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {expertTeam.map((e, i) => (
              <motion.div key={e.name} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-center p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-all">
                  <span className="text-4xl block mb-3">{e.avatar}</span>
                  <h4 className="text-sm font-bold">{locale === "zh" ? e.name : e.nameEn}</h4>
                  <div className="text-xs text-violet-600 font-medium mb-2">{locale === "zh" ? e.role : e.roleEn}</div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{e.credential}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FREE GOV PLAN ═══ */}
      <section id="gov-free-plan" className="py-20 px-4 scroll-mt-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-violet-600 mb-3">
              <Award className="h-3.5 w-3.5" />{locale === "zh" ? "政府专项方案" : "GOVERNMENT SOLUTION"}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">{locale === "zh" ? "政府版 · 全部免费" : "Government Edition · Completely Free"}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{locale === "zh" ? "助力乡村振兴与智慧文旅治理，政府单位可免费使用全部平台功能" : "Supporting rural revitalization and smart tourism governance — all features free for government agencies"}</p>
          </motion.div>
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="rounded-2xl border-2 border-violet-500 bg-linear-to-b from-violet-50/80 to-card dark:from-violet-900/20 dark:to-card shadow-xl ring-2 ring-violet-500/20 p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                      <Landmark className="h-6 w-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold">{locale === "zh" ? "政府专项版" : "Government Edition"}</h3>
                      <span className="text-[10px] font-bold text-white bg-violet-600 px-2 py-0.5 rounded-full">{locale === "zh" ? "限政府单位" : "Gov Only"}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-extrabold text-violet-600">{locale === "zh" ? "免费" : "Free"}</span>
                    <span className="text-sm text-muted-foreground">{locale === "zh" ? "· 永久免费" : "· Forever free"}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { zh: "六大治理平台模块全开放", en: "All 6 governance modules" },
                      { zh: "VSI·CPI·RAI·CBT四大指数", en: "All 4 index systems" },
                      { zh: "大数据驾驶舱无限使用", en: "Unlimited data cockpit" },
                      { zh: "文化遗产保护监测", en: "Heritage monitoring" },
                      { zh: "应急指挥与安全预警", en: "Emergency command & alerts" },
                      { zh: "政策效果评估报告", en: "Policy impact reports" },
                      { zh: "等保三级 · 政务云部署", en: "MLPS L3 · Gov cloud deploy" },
                      { zh: "7×24专属运维团队", en: "24/7 dedicated ops team" },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-violet-500 shrink-0" />
                        <span>{locale === "zh" ? f.zh : f.en}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white h-12 px-8 rounded-xl text-base font-bold shadow-lg shadow-violet-600/20">
                    <Headphones className="h-4 w-4 mr-2" />
                    {locale === "zh" ? "联系政务专员" : "Contact Gov Specialist"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-3">{locale === "zh" ? "需提供政府单位资质证明" : "Government credentials required"}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
            <div className="rounded-3xl bg-linear-to-br from-violet-600 to-purple-700 p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="bg-dot-pattern absolute inset-0 opacity-10" />
              <div className="relative">
                <Landmark className="h-10 w-10 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3">{locale === "zh" ? "让每一分财政投入都可量化可追溯" : "Make Every Fiscal Investment Measurable"}</h2>
                <p className="text-violet-100 mb-8 max-w-xl mx-auto">{locale === "zh" ? "预约政府专项方案演示，我们的文旅治理专家将为您定制从调研到上线的全流程方案" : "Book a government solution demo. Our experts will customize a full-process plan from assessment to launch"}</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button className="bg-white text-violet-700 hover:bg-violet-50 h-12 px-8 rounded-xl text-base font-bold shadow-lg" asChild>
                    <a href="#gov-free-plan">{locale === "zh" ? "免费申请政府方案" : "Apply for Free Gov Plan"}</a>
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl text-base" asChild>
                    <Link href="/government/cockpit">{locale === "zh" ? "体验驾驶舱Demo" : "Try Cockpit Demo"}</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-violet-200">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "等保三级认证" : "MLPS Level 3"}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "政务云支持" : "Gov Cloud Ready"}</span>
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{locale === "zh" ? "7×24运维" : "24/7 Support"}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cross-links */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="ghost" className="rounded-xl" asChild>
              <Link href="/enterprise">{locale === "zh" ? "了解企业版 →" : "Enterprise Edition →"}</Link>
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
