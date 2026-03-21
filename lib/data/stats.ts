export interface Stat {
  id: string;
  value: number;
  suffix: string;
  label: string;
  labelEn: string;
}

// 模拟数据库 — 实际项目中替换为数据库查询或实时统计
let stats: Stat[] = [
  { id: "visitors", value: 8, suffix: "亿+", label: "2024年乡村游客人次", labelEn: "Rural Tourists 2024" },
  { id: "satisfaction", value: 91, suffix: "%", label: "用户满意度", labelEn: "User Satisfaction" },
  { id: "ai_speed", value: 30, suffix: "秒", label: "AI行程生成", labelEn: "AI Trip Generation" },
  { id: "innovations", value: 12, suffix: "项", label: "独创技术创新", labelEn: "Tech Innovations" },
];

export function getStats() {
  return stats;
}

export function updateStat(id: string, value: number) {
  stats = stats.map((s) => (s.id === id ? { ...s, value } : s));
  return stats.find((s) => s.id === id) || null;
}
