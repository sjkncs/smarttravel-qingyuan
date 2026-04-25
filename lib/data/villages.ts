export interface VillageDetail {
  activities: string[];
  bestTime: string;
  transport: string;
  tips: string;
}

export interface Village {
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
  details: VillageDetail;
  visitors?: number;
  reviewCount?: number;
  // GIS fields
  latitude: number;
  longitude: number;
  elevation?: number; // meters above sea level
  terrain?: string;   // "mountain" | "hill" | "plain" | "valley"
  spatialRelations?: { target: string; relation: string; relationEn: string }[];
  province?: string;  // 省份信息
}

// 导入扩展的全国乡村旅游数据
import { extendedVillages } from "./villages-extended";

// 模拟数据库 — 实际项目中替换为数据库查询
let villages: Village[] = [
  {
    id: "fenglin",
    name: "峰林小镇",
    nameEn: "Fenglin Town",
    location: "英德市",
    image: "🏔️",
    rating: 4.8,
    tags: ["喀斯特峰林", "田园风光", "温泉度假"],
    tagsEn: ["Karst Peaks", "Pastoral", "Hot Springs"],
    description: "英西峰林走廊核心区，千座石灰岩峰林环绕，田园牧歌式乡村体验，被誉为「广东小桂林」。",
    descEn: "Core area of Yingxi Karst Corridor, surrounded by thousands of limestone peaks, known as 'Little Guilin of Guangdong'.",
    highlights: { rai: 92, cpi: 78, vsi: 95 },
    season: "四季皆宜",
    seasonEn: "All Seasons",
    category: "nature",
    details: {
      activities: ["徒步观峰", "竹筏漂流", "温泉养生", "田园采摘", "星空露营"],
      bestTime: "3-5月、9-11月",
      transport: "广州出发约2.5小时车程",
      tips: "建议穿运动鞋，带防晒用品",
    },
    visitors: 15820,
    reviewCount: 342,
    latitude: 24.1800,
    longitude: 112.3200,
    elevation: 120,
    terrain: "valley",
    spatialRelations: [
      { target: "youling", relation: "东北方约35km", relationEn: "~35km northeast" },
      { target: "jiqingli", relation: "东南方约90km", relationEn: "~90km southeast" },
    ],
  },
  {
    id: "nangang",
    name: "南岗千年瑶寨",
    nameEn: "Nangang Yao Village",
    location: "连南瑶族自治县",
    image: "🏛️",
    rating: 4.9,
    tags: ["瑶族文化", "非遗传承", "古建筑群"],
    tagsEn: ["Yao Culture", "Intangible Heritage", "Ancient Architecture"],
    description: "全国规模最大的瑶族古寨，千年排瑶历史，长鼓舞、耍歌堂等国家级非遗活态传承地。",
    descEn: "China's largest Yao ancient village with thousand-year Pai Yao history and national intangible heritage.",
    highlights: { rai: 75, cpi: 98, vsi: 88 },
    season: "盘王节(农历十月)",
    seasonEn: "Pan Wang Festival (Lunar October)",
    category: "culture",
    details: {
      activities: ["瑶族歌舞观赏", "长鼓舞体验", "瑶族服饰试穿", "瑶药药浴", "篝火晚会"],
      bestTime: "盘王节期间(农历十月十六)",
      transport: "广州出发约4小时车程",
      tips: "尊重瑶族习俗，拍照前请询问",
    },
    visitors: 23150,
    reviewCount: 567,
    latitude: 24.7200,
    longitude: 112.3800,
    elevation: 803,
    terrain: "mountain",
    spatialRelations: [
      { target: "youling", relation: "南方约8km", relationEn: "~8km south" },
      { target: "fenglin", relation: "西南方约35km", relationEn: "~35km southwest" },
    ],
  },
  {
    id: "shangyue",
    name: "上岳古村",
    nameEn: "Shangyue Village",
    location: "佛冈县",
    image: "🏘️",
    rating: 4.6,
    tags: ["广府古村", "锅耳墙", "宗祠文化"],
    tagsEn: ["Cantonese Village", "Wok-ear Walls", "Ancestral Halls"],
    description: "保存最完整的广府古村落之一，始建于南宋，拥有独特锅耳墙建筑群和深厚宗祠文化。",
    descEn: "One of the best-preserved Cantonese villages, founded in Southern Song Dynasty with unique wok-ear wall architecture.",
    highlights: { rai: 88, cpi: 85, vsi: 92 },
    season: "春秋最佳",
    seasonEn: "Spring & Autumn",
    category: "heritage",
    details: {
      activities: ["古建筑参观", "宗祠文化体验", "书法体验", "农家美食", "古村摄影"],
      bestTime: "3-5月、10-12月",
      transport: "广州出发约1.5小时车程",
      tips: "古建筑请勿触摸，保持安静",
    },
    visitors: 9870,
    reviewCount: 198,
    latitude: 23.8700,
    longitude: 113.5300,
    elevation: 45,
    terrain: "plain",
    spatialRelations: [
      { target: "jiqingli", relation: "西北方约60km", relationEn: "~60km northwest" },
      { target: "fenglin", relation: "西北方约130km", relationEn: "~130km northwest" },
    ],
  },
  {
    id: "youling",
    name: "油岭瑶寨",
    nameEn: "Youling Yao Village",
    location: "连南瑶族自治县",
    image: "🎭",
    rating: 4.7,
    tags: ["瑶族歌舞", "耍歌堂", "原生态"],
    tagsEn: ["Yao Dance", "Song Hall", "Eco-authentic"],
    description: "「中国瑶族第一寨」，耍歌堂发源地，保留最原生态的排瑶生活方式与歌舞传统。",
    descEn: "'China's First Yao Village', birthplace of Song Hall ceremony, preserving authentic Pai Yao lifestyle.",
    highlights: { rai: 68, cpi: 96, vsi: 82 },
    season: "开耕节(农历三月)",
    seasonEn: "Plowing Festival (Lunar March)",
    category: "culture",
    details: {
      activities: ["耍歌堂仪式", "瑶族山歌对唱", "刺绣体验", "原生态徒步", "民俗摄影"],
      bestTime: "开耕节/盘王节期间",
      transport: "广州出发约4.5小时车程",
      tips: "山路较陡，建议穿防滑鞋",
    },
    visitors: 12340,
    reviewCount: 276,
    latitude: 24.6800,
    longitude: 112.2800,
    elevation: 760,
    terrain: "mountain",
    spatialRelations: [
      { target: "nangang", relation: "北方约8km", relationEn: "~8km north" },
      { target: "fenglin", relation: "西南方约38km", relationEn: "~38km southwest" },
    ],
  },
  {
    id: "jiqingli",
    name: "积庆里",
    nameEn: "Jiqingli",
    location: "英德市",
    image: "🍵",
    rating: 4.5,
    tags: ["红茶文化", "茶园观光", "客家风情"],
    tagsEn: ["Black Tea", "Tea Garden", "Hakka Culture"],
    description: "英德红茶核心产区，百年茶文化传承地，集茶园观光、客家民俗、生态休闲于一体。",
    descEn: "Core Yingde black tea region, century-old tea culture heritage combining tea gardens, Hakka customs, and eco-leisure.",
    highlights: { rai: 90, cpi: 72, vsi: 94 },
    season: "采茶季(3-5月)",
    seasonEn: "Tea Season (Mar-May)",
    category: "nature",
    details: {
      activities: ["茶园采茶", "制茶体验", "品茗鉴赏", "客家围屋参观", "乡村骑行"],
      bestTime: "3-5月采茶季",
      transport: "广州出发约2小时车程",
      tips: "采茶建议穿长袖，注意防蚊",
    },
    visitors: 8560,
    reviewCount: 156,
    latitude: 24.1500,
    longitude: 113.3800,
    elevation: 85,
    terrain: "hill",
    spatialRelations: [
      { target: "fenglin", relation: "西方约90km", relationEn: "~90km west" },
      { target: "shangyue", relation: "东南方约60km", relationEn: "~60km southeast" },
    ],
  },
];

export function getVillages() {
  return villages;
}

export function getVillageById(id: string) {
  return villages.find((v) => v.id === id) || null;
}

export function getVillagesByCategory(category: string) {
  if (category === "all") return villages;
  return villages.filter((v) => v.category === category);
}

export function searchVillages(query: string) {
  const q = query.toLowerCase();
  return villages.filter(
    (v) =>
      v.name.includes(query) ||
      v.nameEn.toLowerCase().includes(q) ||
      v.tags.some((t) => t.includes(query)) ||
      v.location.includes(query)
  );
}

export function getVillageRankings(sortBy: "rating" | "visitors" | "cpi" | "rai" | "vsi" = "rating") {
  const sorted = [...villages];
  switch (sortBy) {
    case "rating": sorted.sort((a, b) => b.rating - a.rating); break;
    case "visitors": sorted.sort((a, b) => (b.visitors || 0) - (a.visitors || 0)); break;
    case "cpi": sorted.sort((a, b) => b.highlights.cpi - a.highlights.cpi); break;
    case "rai": sorted.sort((a, b) => b.highlights.rai - a.highlights.rai); break;
    case "vsi": sorted.sort((a, b) => b.highlights.vsi - a.highlights.vsi); break;
  }
  return sorted;
}

// ═══════════════════════════════════
// GIS Utilities
// ═══════════════════════════════════

/** Haversine distance in km between two lat/lng points */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Get villages sorted by distance from a point */
export function getNearbyVillages(
  lat: number, lng: number,
  maxDistanceKm: number = 200
): (Village & { distance: number })[] {
  return villages
    .map((v) => ({
      ...v,
      distance: haversineDistance(lat, lng, v.latitude, v.longitude),
    }))
    .filter((v) => v.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/** Get spatial relationship text between two villages */
export function getSpatialRelation(
  fromId: string, toId: string, locale: string = "zh"
): string | null {
  const village = villages.find((v) => v.id === fromId);
  if (!village?.spatialRelations) return null;
  const rel = village.spatialRelations.find((r) => r.target === toId);
  return rel ? (locale === "zh" ? rel.relation : rel.relationEn) : null;
}

/** Simulated elevation profile along a route between villages */
export interface ElevationPoint {
  distance: number; // km from start
  elevation: number; // meters
  label?: string;
}

export function getElevationProfile(
  fromId: string, toId: string
): ElevationPoint[] {
  const from = villages.find((v) => v.id === fromId);
  const to = villages.find((v) => v.id === toId);
  if (!from || !to) return [];

  const totalDist = haversineDistance(
    from.latitude, from.longitude,
    to.latitude, to.longitude
  );
  const startElev = from.elevation ?? 50;
  const endElev = to.elevation ?? 50;
  const midElev = Math.max(startElev, endElev) + 80 + Math.random() * 200;

  const points: ElevationPoint[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dist = totalDist * t;
    // Simulate terrain with a bell curve + noise
    const base = startElev + (endElev - startElev) * t;
    const peak = midElev * Math.sin(Math.PI * t);
    const noise = (Math.sin(t * 17) * 30 + Math.cos(t * 23) * 20);
    const elev = Math.max(10, base * 0.4 + peak * 0.5 + noise * 0.1);
    points.push({
      distance: Math.round(dist * 10) / 10,
      elevation: Math.round(elev),
      ...(i === 0 ? { label: from.name } : i === steps ? { label: to.name } : {}),
    });
  }
  return points;
}

// 获取所有村落（包括原始和扩展的）
export function getAllVillages(): Village[] {
  return [...villages, ...extendedVillages];
}

// 按省份获取村落
export function getVillagesByProvince(province: string): Village[] {
  const allVillages = getAllVillages();
  return allVillages.filter(v => {
    const provinceMap: Record<string, string[]> = {
      "广东": ["清远", "英德", "连南", "佛冈"],
      "云南": ["大理", "丽江", "香格里拉", "西双版纳", "景洪"],
      "贵州": ["雷山", "贵阳"],
      "广西": ["龙胜", "阳朔", "桂林"],
      "湖南": ["凤凰", "张家界"],
      "浙江": ["桐乡", "嘉善"],
      "安徽": ["黟县", "黄山"],
      "江西": ["上饶", "婺源", "景德镇"],
      "福建": ["永定", "龙岩"],
      "四川": ["九寨沟", "松潘"],
    };
    
    const cities = provinceMap[province] || [];
    return cities.some(city => v.location.includes(city));
  });
}
