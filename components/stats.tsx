"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  labelEn: string;
}

const fallbackStats: StatItem[] = [
  { id: "visitors", value: 8, suffix: "亿+", label: "2024年乡村游客人次", labelEn: "Rural Tourists 2024" },
  { id: "satisfaction", value: 91, suffix: "%", label: "用户满意度", labelEn: "User Satisfaction" },
  { id: "ai_speed", value: 30, suffix: "秒", label: "AI行程生成", labelEn: "AI Trip Generation" },
  { id: "innovations", value: 12, suffix: "项", label: "独创技术创新", labelEn: "Tech Innovations" },
];

export default function Stats() {
  const { locale } = useI18n();
  const [animate, setAnimate] = useState(false);
  const [stats, setStats] = useState<StatItem[]>(fallbackStats);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((json) => { if (json.data) setStats(json.data); })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          onViewportEnter={() => setAnimate(true)}
          viewport={{ once: true, amount: 0.4 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">
                <NumberFlow
                  value={animate ? stat.value : 0}
                  format={{
                    maximumFractionDigits: stat.value % 1 === 0 ? 0 : 1,
                  }}
                />
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {locale === "zh" ? stat.label : (stat.labelEn || stat.label)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
