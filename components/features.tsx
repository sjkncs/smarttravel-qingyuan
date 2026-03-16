"use client";

import { motion } from "framer-motion";
import { Compass, Brain, MapPin, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Compass,
    title: "村落发现引擎",
    subtitle: "告别盲从，发现专属秘境",
    description: "基于「召回-排序」两阶段架构的混合推荐系统，以「乡村口碑分」多维评价模型为质量基石，通过深度学习模型实现千人千面的个性化排序。",
    highlights: ["口碑分算法", "贝叶斯平均", "时间衰减", "个性化排序"],
    gradient: "from-emerald-500 to-teal-600",
    bgGlow: "bg-emerald-500/10",
    href: "/villages",
  },
  {
    icon: Brain,
    title: "AI智能规划大脑",
    subtitle: "30秒搞定出行方案",
    description: "LangChain端侧原生实现，融合RAG检索增强生成、ReAct Agent六工具协同推理、RouterChain意图路由、EntityMemory跨轮次记忆，三级降级确保弱网可用。",
    highlights: ["RAG增强", "ReAct Agent", "6维决策", "三级降级"],
    gradient: "from-sky-500 to-blue-600",
    bgGlow: "bg-sky-500/10",
    href: "/planner",
  },
  {
    icon: MapPin,
    title: "实景地图导航",
    subtitle: "指尖探索村落每一处细节",
    description: "高德地图16层叠加系统，实时天气覆盖、村落安全指数(VSI)可视化、POI智能搜索、A*路径规划、旅游信号聚合，全方位掌握出行信息。",
    highlights: ["16层地图", "VSI安全指数", "A*路径", "实时天气"],
    gradient: "from-amber-500 to-orange-600",
    bgGlow: "bg-amber-500/10",
    href: "/map",
  },
  {
    icon: Sparkles,
    title: "数字人智能伴游",
    subtitle: "会方言的AI导游，全程陪伴",
    description: "支持粤语/瑶语方言理解的AI数字人，12月份季节感知活动推荐、24节气×瑶壮节庆引擎、文化敏感度保护，让旅行更生动有文化。",
    highlights: ["方言理解", "季节感知", "节庆引擎", "文化保护"],
    gradient: "from-rose-500 to-pink-600",
    bgGlow: "bg-rose-500/10",
    href: "/guide",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Core Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            四大核心功能模块
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            您的24小时乡村旅行管家 — 从发现、规划、导航到陪伴的一站式智能化服务
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8 h-full transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg">
                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.gradient} text-white shadow-lg mb-4`}>
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link href={feature.href} className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:underline">
                    了解详情
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
