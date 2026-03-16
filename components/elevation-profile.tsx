"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Mountain, TrendingUp, ArrowUpDown, Route } from "lucide-react";
import type { ElevationPoint } from "@/lib/data/villages";

interface ElevationProfileProps {
  data: ElevationPoint[];
  stats?: {
    maxElevation: number;
    minElevation: number;
    totalDistance: number;
    elevationGain: number;
  };
  locale?: string;
}

export default function ElevationProfile({ data, stats, locale = "zh" }: ElevationProfileProps) {
  const { pathD, areaD, points, viewBox } = useMemo(() => {
    if (data.length < 2) return { pathD: "", areaD: "", points: [], viewBox: "0 0 600 200" };

    const W = 600, H = 180, PX = 40, PY = 20;
    const maxDist = data[data.length - 1].distance;
    const maxElev = Math.max(...data.map((p) => p.elevation));
    const minElev = Math.min(...data.map((p) => p.elevation));
    const elevRange = maxElev - minElev || 1;

    const pts = data.map((p) => ({
      x: PX + (p.distance / maxDist) * (W - 2 * PX),
      y: PY + (1 - (p.elevation - minElev) / elevRange) * (H - 2 * PY),
      ...p,
    }));

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

    return {
      pathD: line,
      areaD: area,
      points: pts,
      viewBox: `0 0 ${W} ${H + 10}`,
    };
  }, [data]);

  if (data.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4"
    >
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Mountain className="h-4 w-4 text-emerald-600" />
        {locale === "zh" ? "海拔剖面图" : "Elevation Profile"}
      </h3>

      {stats && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <TrendingUp className="h-3 w-3 mx-auto text-emerald-600 mb-1" />
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "最高" : "Max"}</div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{stats.maxElevation}m</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-sky-50 dark:bg-sky-900/20">
            <ArrowUpDown className="h-3 w-3 mx-auto text-sky-600 mb-1" />
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "最低" : "Min"}</div>
            <div className="text-sm font-bold text-sky-700 dark:text-sky-300">{stats.minElevation}m</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <TrendingUp className="h-3 w-3 mx-auto text-amber-600 mb-1" />
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "累计爬升" : "Gain"}</div>
            <div className="text-sm font-bold text-amber-700 dark:text-amber-300">{stats.elevationGain}m</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20">
            <Route className="h-3 w-3 mx-auto text-violet-600 mb-1" />
            <div className="text-xs text-muted-foreground">{locale === "zh" ? "总距离" : "Dist"}</div>
            <div className="text-sm font-bold text-violet-700 dark:text-violet-300">{stats.totalDistance}km</div>
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-b from-sky-50/50 to-emerald-50/50 dark:from-sky-900/10 dark:to-emerald-900/10 rounded-xl overflow-hidden">
        <svg viewBox={viewBox} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((t) => (
            <line key={t} x1="40" y1={20 + t * 160} x2="560" y2={20 + t * 160}
              stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="4 4" />
          ))}

          {/* Area fill */}
          <path d={areaD} fill="url(#elevGrad)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="rgb(16, 185, 129)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke="rgb(16, 185, 129)" strokeWidth="2" />
              {p.label && (
                <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[9px] fill-foreground font-medium">
                  {p.label}
                </text>
              )}
              <text x={p.x} y={p.y + 14} textAnchor="middle" className="text-[7px] fill-muted-foreground">
                {p.elevation}m
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {points.filter((_, i) => i % 3 === 0 || i === points.length - 1).map((p, i) => (
            <text key={`x-${i}`} x={p.x} y={195} textAnchor="middle" className="text-[8px] fill-muted-foreground">
              {p.distance}km
            </text>
          ))}
        </svg>
      </div>

      <p className="text-[10px] text-muted-foreground mt-2 text-center">
        {locale === "zh" ? "* 海拔数据为模拟值，实际数据需接入DEM高程服务" : "* Elevation data is simulated. Real data requires DEM service integration."}
      </p>
    </motion.div>
  );
}
