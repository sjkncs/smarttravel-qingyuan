"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Shield, Users, Calendar, Search, ChevronRight, Loader2, Lightbulb, Sparkles, Brain } from "lucide-react";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface VillageData {
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
  category: string;
  details: {
    activities: string[];
    bestTime: string;
    transport: string;
    tips: string;
  };
}

const categories = [
  { id: "all", label: "全部", labelEn: "All" },
  { id: "culture", label: "文化遗产", labelEn: "Culture" },
  { id: "nature", label: "自然风光", labelEn: "Nature" },
  { id: "heritage", label: "古村建筑", labelEn: "Heritage" },
];

export default function VillagesPage() {
  const { locale, t } = useI18n();
  const [villages, setVillages] = useState<VillageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const searchParams = useSearchParams();
  const preSelected = searchParams.get("selected");
  const [selectedVillage, setSelectedVillage] = useState<string | null>(preSelected);
  const scrolledRef = useRef(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchAIInsight = async (villageName: string) => {
    setAiLoading(true);
    setAiInsight(null);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "village_analysis", target: villageName, locale }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsight(data.insight);
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  useEffect(() => {
    fetch("/api/villages")
      .then((res) => res.json())
      .then((json) => { if (json.data) setVillages(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = villages.filter((v) => {
    const matchCategory = activeCategory === "all" || v.category === activeCategory;
    const matchSearch =
      search === "" ||
      v.name.includes(search) ||
      v.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      v.tags.some((tag) => tag.includes(search)) ||
      v.location.includes(search);
    return matchCategory && matchSearch;
  });

  const selected = selectedVillage ? villages.find((v) => v.id === selectedVillage) : null;

  // 从地图页跳转过来时自动滚动到选中的村落卡片
  useEffect(() => {
    if (preSelected && !loading && !scrolledRef.current) {
      scrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById(`village-${preSelected}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [preSelected, loading]);

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={t("page.villages.title")}
        description={t("page.villages.desc")}
      />

      <section className="flex-1 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={locale === "zh" ? "搜索村落名称、标签、地区..." : "Search villages..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card/60 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className={activeCategory === cat.id ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
                >
                  {locale === "zh" ? cat.label : cat.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border border-border bg-card/60 h-80 animate-pulse" />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((village, index) => (
                <motion.div
                  key={village.id}
                  id={`village-${village.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedVillage(selectedVillage === village.id ? null : village.id)}
                >
                  <div className={`rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col ${
                    selectedVillage === village.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}>
                    <div className="h-40 bg-linear-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-6xl relative">
                      {village.image}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {village.rating}
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {village.location}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold mb-1">
                        {locale === "zh" ? village.name : village.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 flex-1">
                        {locale === "zh" ? village.description : village.descEn}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {(locale === "zh" ? village.tags : village.tagsEn).map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 rounded-lg bg-card border border-border">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <MapPin className="h-3 w-3 text-emerald-500" />
                            <span className="text-xs text-muted-foreground">RAI</span>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{village.highlights.rai}</span>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-card border border-border">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Users className="h-3 w-3 text-sky-500" />
                            <span className="text-xs text-muted-foreground">CPI</span>
                          </div>
                          <span className="text-sm font-bold text-sky-600 dark:text-sky-400">{village.highlights.cpi}</span>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-card border border-border">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Shield className="h-3 w-3 text-amber-500" />
                            <span className="text-xs text-muted-foreground">VSI</span>
                          </div>
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{village.highlights.vsi}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {locale === "zh" ? village.season : village.seasonEn}
                        </div>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedVillage === village.id ? "rotate-90" : ""}`} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedVillage === village.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-0 border-t border-border">
                            <div className="pt-4 space-y-3">
                              <div>
                                <h4 className="text-sm font-semibold mb-2">{locale === "zh" ? "推荐活动" : "Activities"}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {village.details.activities.map((a) => (
                                    <span key={a} className="text-xs px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                                      {a}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 rounded-lg bg-card border border-border">
                                  <div className="text-muted-foreground mb-0.5">{locale === "zh" ? "最佳时间" : "Best Time"}</div>
                                  <div className="font-medium">{village.details.bestTime}</div>
                                </div>
                                <div className="p-2 rounded-lg bg-card border border-border">
                                  <div className="text-muted-foreground mb-0.5">{locale === "zh" ? "交通" : "Transport"}</div>
                                  <div className="font-medium">{village.details.transport}</div>
                                </div>
                              </div>
                              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs">
                                <span className="font-medium text-amber-700 dark:text-amber-300 inline-flex items-center gap-1"><Lightbulb className="h-3 w-3" /> {locale === "zh" ? "小贴士" : "Tips"}：</span>
                                <span className="text-muted-foreground">{village.details.tips}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button asChild className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                                  <Link href={`/planner?village=${village.id}`}>
                                    {locale === "zh" ? "规划行程" : "Plan Trip"}
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                  onClick={(e) => { e.stopPropagation(); fetchAIInsight(village.name); }}
                                  disabled={aiLoading}
                                >
                                  {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                                  {locale === "zh" ? "AI分析" : "AI Insight"}
                                </Button>
                              </div>
                              {aiInsight && selectedVillage === village.id && (
                                <div className="mt-2 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-xs text-violet-800 dark:text-violet-200">
                                  <div className="flex items-center gap-1 font-semibold mb-1 text-violet-600 dark:text-violet-400">
                                    <Sparkles className="h-3 w-3" />
                                    {locale === "zh" ? "AI 智能洞察" : "AI Insight"}
                                  </div>
                                  <MarkdownRenderer content={aiInsight} />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{locale === "zh" ? "没有找到匹配的村落" : "No villages found"}</p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
