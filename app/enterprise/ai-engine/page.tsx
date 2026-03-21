"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain, Zap, Users, TrendingUp, BarChart3, RefreshCw, ArrowRight,
  Sparkles, Target, Shuffle, Layers, Search, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const mockUsers = [
  { id: "U001", name: "张女士", tags: ["亲子游", "自然风光", "摄影"], score: 0.94, rec: "峰林小镇·温泉亲子套餐" },
  { id: "U002", name: "李先生", tags: ["文化体验", "少数民族", "历史"], score: 0.91, rec: "千年瑶寨·盘王节深度体验" },
  { id: "U003", name: "王同学", tags: ["户外探险", "露营", "徒步"], score: 0.88, rec: "油岭瑶寨·开耕节+徒步" },
  { id: "U004", name: "赵女士", tags: ["美食", "田园", "采摘"], score: 0.92, rec: "积庆里·采茶+围龙屋" },
  { id: "U005", name: "陈先生", tags: ["摄影", "古建筑", "人文"], score: 0.89, rec: "上岳古村·古建摄影之旅" },
];

const abTests = [
  { name: "推荐算法A (协同过滤)", nameEn: "Algorithm A (CF)", ctr: 3.2, conv: 1.8, revenue: 42800 },
  { name: "推荐算法B (RAG混合)", nameEn: "Algorithm B (RAG Hybrid)", ctr: 4.8, conv: 2.6, revenue: 68500, winner: true },
];

const modelMetrics = [
  { name: "召回率", nameEn: "Recall", value: "94.2%", trend: "+2.1%" },
  { name: "精确率", nameEn: "Precision", value: "87.6%", trend: "+3.4%" },
  { name: "NDCG@10", nameEn: "NDCG@10", value: "0.82", trend: "+0.05" },
  { name: "覆盖率", nameEn: "Coverage", value: "91.3%", trend: "+1.8%" },
];

export default function AIEnginePage() {
  const { locale } = useI18n();
  const [selectedUser, setSelectedUser] = useState(0);

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" />
              {locale === "zh" ? "AI推荐引擎控制台" : "AI Recommendation Engine Console"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "RAG增强 · 协同过滤 · 实时A/B测试" : "RAG-enhanced · Collaborative Filtering · Real-time A/B"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Model Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {modelMetrics.map((m, i) => (
              <motion.div key={m.name} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground mb-1">{locale === "zh" ? m.name : m.nameEn}</div>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-emerald-600 mt-0.5">{m.trend}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Profiling & Recommendations */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
                <Users className="h-4 w-4 text-violet-500" />
                {locale === "zh" ? "用户画像与推荐预览" : "User Profiling & Recommendation Preview"}
              </h3>
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {mockUsers.map((u, i) => (
                  <button key={u.id} onClick={() => setSelectedUser(i)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedUser === i ? "bg-violet-600 text-white" : "bg-muted hover:bg-muted/80"}`}>
                    {u.name}
                  </button>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold">{mockUsers[selectedUser].name}</span>
                  <span className="text-xs text-muted-foreground">{mockUsers[selectedUser].id}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {mockUsers[selectedUser].tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/20 text-violet-600">{t}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "TOP1 推荐" : "TOP1 Recommendation"}</div>
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{mockUsers[selectedUser].rec}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "匹配度" : "Match"}</div>
                    <div className="text-lg font-extrabold text-emerald-600">{(mockUsers[selectedUser].score * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* A/B Testing */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
                <Shuffle className="h-4 w-4 text-sky-500" />
                {locale === "zh" ? "A/B 实验对比" : "A/B Experiment Comparison"}
              </h3>
              <div className="space-y-3">
                {abTests.map((t) => (
                  <div key={t.name} className={`p-4 rounded-xl border ${t.winner ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-border"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{locale === "zh" ? t.name : t.nameEn}</span>
                      {t.winner && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">WINNER</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-lg font-bold">{t.ctr}%</div>
                        <div className="text-[10px] text-muted-foreground">CTR</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{t.conv}%</div>
                        <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "转化率" : "Conv"}</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">¥{(t.revenue / 1000).toFixed(1)}K</div>
                        <div className="text-[10px] text-muted-foreground">{locale === "zh" ? "日均收入" : "Daily Rev"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RAG Knowledge Base */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-4">
              <Search className="h-4 w-4 text-amber-500" />
              {locale === "zh" ? "RAG 知识库状态" : "RAG Knowledge Base Status"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "村落文档", labelEn: "Village Docs", count: 25 },
                { label: "文化知识", labelEn: "Cultural", count: 18 },
                { label: "季节活动", labelEn: "Seasonal", count: 12 },
                { label: "交通路线", labelEn: "Routes", count: 8 },
                { label: "向量维度", labelEn: "Vector Dim", count: 64 },
              ].map((k) => (
                <div key={k.label} className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="text-xl font-bold">{k.count}</div>
                  <div className="text-[10px] text-muted-foreground">{locale === "zh" ? k.label : k.labelEn}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
