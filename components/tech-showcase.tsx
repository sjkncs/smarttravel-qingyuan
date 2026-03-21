"use client";

import { motion } from "framer-motion";
import { Database, Brain, Route, Shield, Layers, Cpu, GitBranch, Zap } from "lucide-react";

const techLayers = [
  {
    category: "AI引擎层",
    color: "emerald",
    items: [
      { icon: Brain, name: "LangChain ArkTS原生", desc: "RAG + ReAct Agent + RouterChain" },
      { icon: Database, name: "VectorStore 64维", desc: "TF-IDF + 余弦相似度 + MMR" },
      { icon: GitBranch, name: "EntityMemory", desc: "6类实体跨轮次记忆" },
    ],
  },
  {
    category: "算法层",
    color: "sky",
    items: [
      { icon: Route, name: "路径优化", desc: "Dijkstra + A* + TSP贪心" },
      { icon: Layers, name: "推荐引擎", desc: "召回-排序两阶段 + 口碑分" },
      { icon: Cpu, name: "空间索引", desc: "KD-Tree + Grid哈希 + KNN" },
    ],
  },
  {
    category: "创新层",
    color: "amber",
    items: [
      { icon: Shield, name: "RAI可达性指数", desc: "交通/信号/基建/无障碍 四维" },
      { icon: Shield, name: "CPI文化保护", desc: "非遗濒危度 + 传承人图谱" },
      { icon: Zap, name: "CBT社区受益", desc: "收入透明 + 青年回流追踪" },
    ],
  },
];

const innovationPoints = [
  { label: "端侧LangChain", value: "行业首创", highlight: true },
  { label: "ReAct Agent", value: "6工具协同", highlight: true },
  { label: "三级降级", value: "零断线", highlight: false },
  { label: "知识库文档", value: "20+篇", highlight: false },
  { label: "算法覆盖", value: "12项独创", highlight: true },
  { label: "方言理解", value: "粤语/瑶语", highlight: false },
];

export default function TechShowcase() {
  return (
    <section id="tech" className="py-20 md:py-28 px-4 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Technology Architecture
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            AI技术架构
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            HarmonyOS ArkTS原生实现完整LangChain架构，12项代码独创创新超越PPT设计
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {techLayers.map((layer, layerIdx) => (
            <motion.div
              key={layer.category}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: layerIdx * 0.15 }}
              className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6"
            >
              <div className={`text-sm font-semibold mb-4 px-3 py-1 rounded-full w-fit ${
                layer.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300" :
                layer.color === "sky" ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300" :
                "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              }`}>
                {layer.category}
              </div>
              <div className="space-y-4">
                {layer.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      layer.color === "emerald" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                      layer.color === "sky" ? "bg-sky-50 dark:bg-sky-900/20 text-sky-600" :
                      "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                    }`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-linear-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 p-6 md:p-8"
        >
          <h3 className="text-lg font-bold mb-1 text-center">创新亮点</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">代码实现超越PPT设计的12项独创技术</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {innovationPoints.map((point) => (
              <div key={point.label} className="text-center">
                <div className={`text-lg font-bold ${point.highlight ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                  {point.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{point.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 rounded-2xl border border-border bg-card/60 p-6 md:p-8"
        >
          <h3 className="text-lg font-bold mb-4 text-center">三级降级容错架构</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <div>
                <div className="text-sm font-semibold">Level 1: LangChain</div>
                <div className="text-xs text-muted-foreground">RAG + Agent + Memory</div>
              </div>
            </div>
            <div className="text-muted-foreground text-lg hidden md:block">→</div>
            <div className="text-muted-foreground text-lg md:hidden rotate-90">→</div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
              <div className="h-3 w-3 rounded-full bg-amber-500"></div>
              <div>
                <div className="text-sm font-semibold">Level 2: 传统LLM</div>
                <div className="text-xs text-muted-foreground">chatCompletion 无RAG</div>
              </div>
            </div>
            <div className="text-muted-foreground text-lg hidden md:block">→</div>
            <div className="text-muted-foreground text-lg md:hidden rotate-90">→</div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800">
              <div className="h-3 w-3 rounded-full bg-rose-500"></div>
              <div>
                <div className="text-sm font-semibold">Level 3: 本地引擎</div>
                <div className="text-xs text-muted-foreground">知识库 + 关键词匹配</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
