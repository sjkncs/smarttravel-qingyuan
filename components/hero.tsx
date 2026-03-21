"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, Mountain, MapPin, Coffee, Music, Wallet } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative justify-center items-center overflow-hidden">
      <section className="max-w-(--breakpoint-xl) mx-auto px-4 py-20 md:py-32 gap-12 md:px-8 flex flex-col justify-center items-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0 }}
          className="flex flex-col justify-center items-center space-y-6 max-w-4xl mx-auto text-center"
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="w-fit text-sm bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-4 py-1.5 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1.5"
          >
            <Leaf className="h-3.5 w-3.5" />
            AI驱动 · 乡村旅游数字化解决方案
          </motion.span>

          <h1 className="text-4xl font-bold tracking-tight mx-auto md:text-6xl lg:text-7xl text-pretty bg-linear-to-b from-emerald-800 dark:from-emerald-200 to-foreground dark:to-foreground bg-clip-text text-transparent leading-tight">
            告别盲从，发现你的
            <br />
            <span className="bg-linear-to-r from-emerald-600 to-emerald-400 dark:from-emerald-400 dark:to-emerald-200 bg-clip-text text-transparent">专属小众秘境</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl mx-auto text-muted-foreground text-balance leading-relaxed">
            您的24小时乡村旅行管家 — 融合AI智能规划、村落发现引擎、实景地图导航、数字人智能伴游，
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">30秒生成带文化解读的个性化行程</span>
          </p>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-8">
              <Link href="#features">
                探索功能
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-8">
              <Link href="#tech">
                <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
                技术架构
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6 pt-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              HarmonyOS原生应用
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              LangChain端侧AI引擎
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              清远5大特色村落
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              瑶族/壮族文化保护
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, type: "spring", bounce: 0 }}
          className="w-full max-w-5xl mx-auto mt-8"
        >
          <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card/80 backdrop-blur-sm shadow-2xl shadow-emerald-900/10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-10 bg-card flex items-center px-4 gap-2 border-b border-border">
              <div className="h-3 w-3 rounded-full bg-rose-400"></div>
              <div className="h-3 w-3 rounded-full bg-amber-400"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
              <span className="ml-3 text-xs text-muted-foreground">智游清远 — AI对话规划</span>
            </div>

            <div className="pt-14 pb-8 px-6 md:px-10 space-y-4">
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Mountain className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                  <p className="text-sm">您好！我是清远旅游AI助手「小智」，专精广东清远乡村/少数民族旅游。想去哪里探索呢？</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-md">
                  <p className="text-sm">带70岁老人和5岁小孩，想体验瑶族文化，预算3000元，3天行程</p>
                </div>
                <div className="shrink-0 h-8 w-8 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-xs font-medium">
                  游客
                </div>
              </div>

              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-lg">
                  <p className="text-sm">
                    已为您规划<span className="text-emerald-600 dark:text-emerald-400 font-semibold">「亲子瑶乡文化之旅」</span>！
                    考虑到老人和幼儿，已筛选平坦路线、确保休息点间隔≤800米。
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> 千年瑶寨</span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Coffee className="h-3 w-3" /> 瑶族药浴</span>
                    <span className="text-xs bg-sky-100 dark:bg-sky-800/40 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Music className="h-3 w-3" /> 长鼓舞体验</span>
                    <span className="text-xs bg-rose-100 dark:bg-rose-800/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> 预算内</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5, type: "spring", bounce: 0 }}
        className="w-full h-full absolute -top-32 flex justify-end items-center pointer-events-none"
      >
        <div className="w-3/4 flex justify-center items-center">
          <div className="w-12 h-150 bg-light blur-[100px] rounded-3xl max-sm:rotate-15 sm:rotate-35 will-change-transform opacity-60"></div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1, type: "spring", bounce: 0 }}
        className="w-full h-full absolute -top-20 -left-20 flex items-center pointer-events-none"
      >
        <div className="w-1/3 flex justify-center items-center">
          <div className="w-16 h-100 bg-emerald-400/30 blur-[80px] rounded-3xl -rotate-20 will-change-transform"></div>
        </div>
      </motion.div>
    </div>
  );
}
