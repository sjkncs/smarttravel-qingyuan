"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, MapPin, Users, Shield, TrendingUp, Eye, MessageSquare, Medal, Crown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

type SortBy = "rating" | "visitors" | "cpi" | "rai" | "vsi";

interface Village {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  image: string;
  rating: number;
  tags: string[];
  tagsEn: string[];
  description: string;
  descEn: string;
  highlights: { rai: number; cpi: number; vsi: number };
  season: string;
  seasonEn: string;
  visitors?: number;
  reviewCount?: number;
}

const rankTabs: { id: SortBy; label: string; labelEn: string; icon: typeof Star; color: string }[] = [
  { id: "rating", label: "综合评分", labelEn: "Rating", icon: Star, color: "text-amber-500" },
  { id: "visitors", label: "人气排行", labelEn: "Popularity", icon: Eye, color: "text-rose-500" },
  { id: "cpi", label: "文化保护", labelEn: "Cultural", icon: Users, color: "text-sky-500" },
  { id: "rai", label: "可达性", labelEn: "Accessibility", icon: MapPin, color: "text-emerald-500" },
  { id: "vsi", label: "安全指数", labelEn: "Safety", icon: Shield, color: "text-violet-500" },
];

const rankIcons = [Crown, Medal, Award];
const rankColors = ["text-amber-500", "text-slate-400", "text-orange-600"];
const rankBg = [
  "bg-linear-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200 dark:border-amber-800",
  "bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200 dark:border-slate-700",
  "bg-linear-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-200 dark:border-orange-800",
];

export default function RankingsPage() {
  const { locale } = useI18n();
  const [sortBy, setSortBy] = useState<SortBy>("rating");
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/rankings?sortBy=${sortBy}`)
      .then((res) => res.json())
      .then((json) => {
        setVillages(json.data);
        setLastUpdate(json.timestamp);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  const getScoreValue = (v: Village) => {
    switch (sortBy) {
      case "rating": return v.rating;
      case "visitors": return v.visitors || 0;
      case "cpi": return v.highlights.cpi;
      case "rai": return v.highlights.rai;
      case "vsi": return v.highlights.vsi;
    }
  };

  const getScoreLabel = () => {
    const tab = rankTabs.find((t) => t.id === sortBy);
    return locale === "zh" ? tab?.label || "" : tab?.labelEn || "";
  };

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={locale === "zh" ? "村落排行榜" : "Village Rankings"}
        description={locale === "zh" ? "基于后台实时数据的多维度村落排名" : "Multi-dimensional village rankings based on real-time backend data"}
      />

      <section className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 flex-wrap">
              {rankTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={sortBy === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(tab.id)}
                  className={sortBy === tab.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                >
                  <tab.icon className={`h-3.5 w-3.5 mr-1.5 ${sortBy === tab.id ? "text-white" : tab.color}`} />
                  {locale === "zh" ? tab.label : tab.labelEn}
                </Button>
              ))}
            </div>
            {lastUpdate > 0 && (
              <span className="text-xs text-muted-foreground hidden md:block">
                {locale === "zh" ? "数据更新: " : "Updated: "}
                {new Date(lastUpdate).toLocaleTimeString()}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {villages.map((village, index) => {
                const isTop3 = index < 3;
                const RankIcon = isTop3 ? rankIcons[index] : Trophy;
                const scoreVal = getScoreValue(village);

                return (
                  <motion.div
                    key={village.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link href={`/villages?search=${encodeURIComponent(locale === "zh" ? village.name : village.nameEn)}`}>
                      <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                        isTop3 ? rankBg[index] : "bg-card border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}>
                        <div className="flex items-center justify-center w-10 h-10 shrink-0">
                          {isTop3 ? (
                            <RankIcon className={`h-7 w-7 ${rankColors[index]}`} />
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          )}
                        </div>

                        <div className="text-3xl shrink-0">{village.image}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`font-bold truncate ${isTop3 ? "text-base" : "text-sm"}`}>
                              {locale === "zh" ? village.name : village.nameEn}
                            </h3>
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5 shrink-0">
                              <MapPin className="h-3 w-3" />
                              {village.location}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(locale === "zh" ? village.tags : village.tagsEn).slice(0, 3).map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-center hidden sm:block">
                            <div className="text-xs text-muted-foreground mb-0.5">
                              <Star className="h-3 w-3 inline text-amber-500" /> {locale === "zh" ? "评分" : "Rating"}
                            </div>
                            <div className="font-bold text-sm">{village.rating}</div>
                          </div>
                          <div className="text-center hidden sm:block">
                            <div className="text-xs text-muted-foreground mb-0.5">
                              <Eye className="h-3 w-3 inline text-rose-400" /> {locale === "zh" ? "访客" : "Visitors"}
                            </div>
                            <div className="font-bold text-sm">{((village.visitors || 0) / 1000).toFixed(1)}k</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-0.5">{getScoreLabel()}</div>
                            <div className={`text-lg font-bold ${isTop3 ? rankColors[index] : "text-emerald-600 dark:text-emerald-400"}`}>
                              {sortBy === "visitors" ? `${((scoreVal as number) / 1000).toFixed(1)}k` : scoreVal}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 text-center"
          >
            <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {locale === "zh"
                ? "排行榜数据来自后台API实时同步，包含RAI可达性、CPI文化保护、VSI安全等多维度评估指标"
                : "Rankings are synced from backend API in real-time, including RAI, CPI, VSI multi-dimensional metrics"}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              API: <code className="text-emerald-600">/api/rankings?sortBy={sortBy}</code>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
