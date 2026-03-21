"use client";

import { motion } from "framer-motion";
import { Star, GitFork, ExternalLink, Code2, Cpu, Map, Brain, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const projects = [
  {
    name: "LangChain-ArkTS",
    nameEn: "LangChain-ArkTS",
    desc: "HarmonyOS原生LangChain实现，含VectorStore、RAGChain、ReActAgent、RouterChain、EntityMemory完整架构",
    descEn: "Native HarmonyOS LangChain with VectorStore, RAGChain, ReActAgent, RouterChain, EntityMemory",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 128,
    forks: 34,
    icon: Brain,
    tags: ["RAG", "ReAct Agent", "端侧AI"],
    tagsEn: ["RAG", "ReAct Agent", "On-device AI"],
    href: "/planner",
  },
  {
    name: "Village-Discovery-Engine",
    nameEn: "Village-Discovery-Engine",
    desc: "口碑分算法 + 匈牙利匹配 + RAI可达性指数 + CPI文化保护指数，八维决策推荐引擎",
    descEn: "Reputation scoring + Hungarian matching + RAI accessibility + CPI cultural protection, 8-dim recommendation",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 96,
    forks: 22,
    icon: Map,
    tags: ["算法", "推荐系统", "匈牙利匹配"],
    tagsEn: ["Algorithm", "RecSys", "Hungarian"],
    href: "/villages",
  },
  {
    name: "Amap-16Layer-System",
    nameEn: "Amap-16Layer-System",
    desc: "16层高德地图叠加系统，集成天气覆盖、VSI安全指数、POI搜索、路线规划、人流热力图",
    descEn: "16-layer Amap system with weather overlay, VSI safety index, POI search, route planning, heatmap",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 85,
    forks: 19,
    icon: Map,
    tags: ["地图", "实时数据", "多图层"],
    tagsEn: ["Map", "Real-time", "Multi-layer"],
    href: "/map",
  },
  {
    name: "Digital-Human-Guide",
    nameEn: "Digital-Human-Guide",
    desc: "支持粤语/瑶语方言理解的AI数字人导游，20+篇知识库文档，12月份季节感知推荐",
    descEn: "Cantonese/Yao dialect AI guide with 20+ knowledge docs and seasonal awareness",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 73,
    forks: 15,
    icon: Cpu,
    tags: ["NLP", "方言", "知识库"],
    tagsEn: ["NLP", "Dialect", "Knowledge Base"],
    href: "/guide",
  },
  {
    name: "CBT-Tracking-System",
    nameEn: "CBT-Tracking-System",
    desc: "社区受益追踪系统，收入透明分配、在地雇佣率监控、青年回流统计，支持链上存证",
    descEn: "Community Benefit Tracking: transparent income, local hire monitoring, youth return stats, on-chain verification",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 61,
    forks: 11,
    icon: Users,
    tags: ["乡村振兴", "透明度", "CBT"],
    tagsEn: ["Rural Revival", "Transparency", "CBT"],
    href: "/community",
  },
  {
    name: "3-Level-Fallback",
    nameEn: "3-Level-Fallback",
    desc: "三级降级容错架构：LangChain RAG/Agent → 传统LLM调用 → 本地规则引擎，确保离线可用",
    descEn: "3-level fallback: LangChain RAG/Agent → Traditional LLM → Local rule engine, offline-capable",
    lang: "ArkTS",
    langColor: "#3B82F6",
    stars: 54,
    forks: 8,
    icon: Shield,
    tags: ["容错", "离线", "降级策略"],
    tagsEn: ["Fallback", "Offline", "Degradation"],
    href: "/#tech",
  },
];

export default function Showcase() {
  const { locale } = useI18n();

  return (
    <section id="showcase" className="py-16 sm:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Code2 className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              {locale === "zh" ? "开源项目" : "Open Source"}
            </span>
          </div>
          <h2 className="text-xl font-semibold sm:text-2xl bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            {locale === "zh" ? "核心技术模块" : "Core Tech Modules"}
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-center">
            {locale === "zh"
              ? "12项代码独创创新，HarmonyOS ArkTS原生实现，所有模块开源可审计"
              : "12 original innovations, native HarmonyOS ArkTS, all modules open-source & auditable"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, idx) => (
            <motion.div
              key={project.name}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Link href={project.href} className="block h-full">
                <div className="h-full rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <project.icon className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 group-hover:underline">
                        {locale === "zh" ? project.name : project.nameEn}
                      </h3>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {locale === "zh" ? project.desc : project.descEn}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(locale === "zh" ? project.tags : project.tagsEn).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: project.langColor }}
                      ></span>
                      <span>{project.lang}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="h-3 w-3" />
                      <span>{project.forks}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
