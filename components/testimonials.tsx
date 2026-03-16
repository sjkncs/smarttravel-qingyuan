"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface TestimonialItem {
  id?: string;
  name: string;
  role: string;
  content: string;
  contentEn?: string;
  rating: number;
}

const fallbackTestimonials: TestimonialItem[] = [
  { name: "李阿姨", role: "广州退休教师", content: "带着70岁老伴去千年瑶寨，AI自动规划了平坦路线，还标注了厕所和休息点。瑶族药浴太舒服了！", rating: 5 },
  { name: "张先生", role: "深圳程序员 · 带娃出行", content: "30秒就生成了3天亲子行程，考虑了5岁孩子的体力。小智还用粤语给我讲了瑶族的长鼓舞故事！", rating: 5 },
  { name: "王老师", role: "高校文旅研究员", content: "文化保护指数(CPI)和社区受益追踪(CBT)让我眼前一亮。这不只是旅游App，更是乡村振兴的数字化工具。", rating: 5 },
  { name: "陈村长", role: "连南瑶寨村干部", content: "自从接入平台，游客知道我们的节庆活动了。盘王节期间订单增长了3倍，村民收入透明可查。", rating: 5 },
  { name: "刘同学", role: "大学生背包客", content: "以前只知道去网红景点排队，现在发现了好多小众村落！口碑分算法真的靠谱。", rating: 4 },
  { name: "赵导游", role: "清远持证导游", content: "数字人伴游功能太强了，连瑶语都能理解。游客问到油岭瑶寨的耍歌堂历史，AI比我讲得还详细！", rating: 5 },
  { name: "何女士", role: "佛山摄影爱好者", content: "AI推荐了英西峰林日出最佳机位，还告诉我雨后初晴去效果最好。拍出来的照片获了省摄影赛银奖！", rating: 5 },
  { name: "杨大哥", role: "东莞自驾游达人", content: "实景地图导航太实用了，山路弯道提前提醒，还能看到实时路况。VSI安全指数给了我信心。", rating: 5 },
  { name: "林小姐", role: "香港游客", content: "第一次来清远乡村游，粤语沟通完全没问题！小智用粤语讲解客家围屋的故事，感觉像有个本地朋友带路。", rating: 5 },
  { name: "周老板", role: "上岳古村民宿经营者", content: "CBT系统让每笔收入都透明，游客信任度提高了。平台引流后入住率涨了40%。", rating: 5 },
];

const StarIcon = () => (
  <svg className="h-3.5 w-3.5 text-yellow-500 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function TestimonialCard({ t }: { t: TestimonialItem }) {
  return (
    <div className="w-[300px] sm:w-[350px] shrink-0 rounded-xl border border-border bg-card p-4 sm:p-5 transition-colors duration-300 hover:border-emerald-300 dark:hover:border-emerald-700">
      <div className="mb-2 flex sm:mb-3">
        {[...Array(t.rating)].map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>
      <p className="mb-4 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-relaxed line-clamp-4">
        &ldquo;{t.content}&rdquo;
      </p>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:h-10 sm:w-10 sm:text-sm">
          {t.name[0]}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-xs font-semibold sm:text-sm">{t.name}</h4>
          <p className="truncate text-[10px] leading-tight text-muted-foreground sm:text-xs">{t.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { locale } = useI18n();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(fallbackTestimonials);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((json) => { if (json.data) setTestimonials(json.data); })
      .catch(() => {});
  }, []);

  const row1 = testimonials.slice(0, 5);
  const row2 = testimonials.slice(5, 10);

  return (
    <section id="testimonials" className="py-16 sm:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 flex flex-col gap-3 text-center sm:mb-16"
        >
          <h2 className="text-xl font-semibold sm:text-2xl bg-linear-to-b from-foreground to-muted-foreground text-transparent bg-clip-text">
            {locale === "zh" ? "用户真实评价" : "User Reviews"}
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-center">
            {locale === "zh" ? "来自游客、村民、研究者的真实反馈" : "Real feedback from tourists, villagers, and researchers"}
          </p>
        </motion.div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="mb-4 sm:mb-6">
          <div className="flex gap-4 sm:gap-6 animate-marquee-left hover:paused">
            {[...row1, ...row1, ...row1].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex gap-4 sm:gap-6 animate-marquee-right hover:paused">
            {[...row2, ...row2, ...row2].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
