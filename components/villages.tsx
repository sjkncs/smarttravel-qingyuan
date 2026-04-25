"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Star, Shield, Users, Calendar, Mountain, Landmark, Home, Theater, Leaf, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface VillageItem {
  id?: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  tags: string[];
  description: string;
  highlights: { rai: number; cpi: number; vsi: number };
  season: string;
}

// 扩展的全国乡村数据
const fallbackVillages: VillageItem[] = [
  // 清远原有村落
  { name: "峰林小镇", location: "广东·英德市", image: "mountain", rating: 4.8, tags: ["喀斯特峰林", "田园风光", "温泉度假"], description: "英西峰林走廊核心区，千座石灰岩峰林环绕，田园牧歌式乡村体验。", highlights: { rai: 92, cpi: 78, vsi: 95 }, season: "四季皆宜" },
  { name: "南岗千年瑶寨", location: "广东·连南瑶族自治县", image: "landmark", rating: 4.9, tags: ["瑶族文化", "非遗传承", "古建筑群"], description: "全国规模最大的瑶族古寨，千年排瑶历史，长鼓舞、耍歌堂等国家级非遗活态传承地。", highlights: { rai: 75, cpi: 98, vsi: 88 }, season: "盘王节(农历十月)" },
  { name: "上岳古村", location: "广东·佛冈县", image: "home", rating: 4.6, tags: ["广府古村", "锅耳墙", "宗祠文化"], description: "保存最完整的广府古村落之一，始建于南宋，拥有独特锅耳墙建筑群和深厚宗祠文化。", highlights: { rai: 88, cpi: 85, vsi: 92 }, season: "春秋最佳" },
  { name: "油岭瑶寨", location: "广东·连南瑶族自治县", image: "theater", rating: 4.7, tags: ["瑶族歌舞", "耍歌堂", "原生态"], description: "「中国瑶族第一寨」，耍歌堂发源地，保留最原生态的排瑶生活方式与歌舞传统。", highlights: { rai: 68, cpi: 96, vsi: 82 }, season: "开耕节(农历三月)" },
  { name: "积庆里", location: "广东·英德市", image: "leaf", rating: 4.5, tags: ["红茶文化", "茶园观光", "客家风情"], description: "英德红茶核心产区，百年茶文化传承地，集茶园观光、客家民俗、生态休闲于一体。", highlights: { rai: 90, cpi: 72, vsi: 94 }, season: "采茶季(3-5月)" },
  // 云南
  { name: "喜洲古镇", location: "云南·大理", image: "home", rating: 4.8, tags: ["白族建筑", "洱海风光", "扎染工艺"], description: "白族民居建筑博物馆，保存最多、最好的白族民居建筑群，体验传统扎染工艺。", highlights: { rai: 94, cpi: 88, vsi: 91 }, season: "春秋最佳" },
  { name: "束河古镇", location: "云南·丽江", image: "landmark", rating: 4.7, tags: ["纳西文化", "茶马古道", "慢生活"], description: "纳西族聚居地，茶马古道重镇，比大研古镇更宁静，适合深度文化体验。", highlights: { rai: 89, cpi: 85, vsi: 87 }, season: "四季皆宜" },
  // 贵州
  { name: "西江千户苗寨", location: "贵州·黔东南", image: "theater", rating: 4.9, tags: ["苗族文化", "吊脚楼", "夜景璀璨"], description: "世界最大的苗族聚居村寨，保存苗族原始生态文化完整，夜景震撼人心。", highlights: { rai: 72, cpi: 99, vsi: 85 }, season: "苗年(农历十月)" },
  // 浙江
  { name: "乌镇", location: "浙江·嘉兴", image: "home", rating: 4.8, tags: ["江南水乡", "互联网大会", "戏剧节"], description: "中国最后的枕水人家，典型江南水乡古镇，世界互联网大会永久会址。", highlights: { rai: 96, cpi: 92, vsi: 94 }, season: "春秋最佳" },
  // 安徽
  { name: "宏村", location: "安徽·黄山", image: "home", rating: 4.9, tags: ["徽派建筑", "水墨画境", "世界遗产"], description: "画里乡村，徽派建筑典范，南湖月沼倒映马头墙，如入水墨画卷。", highlights: { rai: 93, cpi: 90, vsi: 96 }, season: "春秋最佳" },
];

export default function Villages() {
  const { locale } = useI18n();
  const [villages, setVillages] = useState<VillageItem[]>(fallbackVillages);

  useEffect(() => {
    fetch("/api/villages")
      .then((res) => res.json())
      .then((json) => { if (json.data) setVillages(json.data); })
      .catch(() => {});
  }, []);
  return (
    <section id="villages" className="py-20 md:py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
            Featured Villages
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            精选15+特色乡村
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            算法穿透流量迷雾，发掘服务质量高、口碑好的原生态乡村，覆盖10个省份
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {villages.slice(0, 6).map((village, index) => (
            <motion.div
              key={village.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group"
            >
              <Link href={`/villages?search=${encodeURIComponent(village.name)}`} className="block h-full">
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg h-full flex flex-col cursor-pointer">
                <div className="h-40 bg-linear-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center relative">
                  {(() => {
                    const iconMap: Record<string, React.ReactNode> = {
                      mountain: <Mountain className="h-12 w-12 text-emerald-600/60" />,
                      landmark: <Landmark className="h-12 w-12 text-emerald-600/60" />,
                      home: <Home className="h-12 w-12 text-emerald-600/60" />,
                      theater: <Theater className="h-12 w-12 text-emerald-600/60" />,
                      leaf: <Leaf className="h-12 w-12 text-emerald-600/60" />,
                    };
                    return iconMap[village.image] || <MapPin className="h-12 w-12 text-emerald-600/60" />;
                  })()}
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
                  <h3 className="text-lg font-bold mb-1">{village.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 flex-1">
                    {village.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {village.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
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
                      {village.season}
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {locale === "zh" ? "查看详情" : "View"} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Button asChild variant="outline" size="lg" className="border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            <Link href="/villages">
              {locale === "zh" ? "查看全部村落" : "Explore All Villages"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
