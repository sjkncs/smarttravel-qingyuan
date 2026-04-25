// ═══════════════════════════════════════════════════════════════
// 智游乡野 - 全国乡村旅游数据扩展
// 从清远扩展到全国特色乡村
// ═══════════════════════════════════════════════════════════════

import type { Village, VillageDetail, ElevationPoint } from "./villages";

// 云南省特色乡村
export const yunnanVillages: Village[] = [
  {
    id: "xizhou",
    name: "喜洲古镇",
    nameEn: "Xizhou Ancient Town",
    location: "大理市",
    image: "🏘️",
    rating: 4.7,
    tags: ["白族文化", "古建筑", "田园风光"],
    tagsEn: ["Bai Culture", "Ancient Architecture", "Rural Scenery"],
    description: "白族本土文化发源地之一，建筑造型独具特色，庄重雄浑，古朴典雅。",
    descEn: "Birthplace of Bai culture with unique architecture, solemn and elegant.",
    highlights: { rai: 89, cpi: 94, vsi: 91 },
    season: "四季皆宜",
    seasonEn: "All Seasons",
    category: "culture",
    details: {
      activities: ["白族民居参观", "扎染体验", "田园骑行", "古法造纸", "品尝喜洲粑粑"],
      bestTime: "3-5月、9-11月",
      transport: "大理古城出发约18公里",
      tips: "建议租自行车游览，体验白族三道茶",
    },
    visitors: 18560,
    reviewCount: 423,
    latitude: 25.856048,
    longitude: 100.13721,
    elevation: 1980,
    terrain: "plain",
  },
  {
    id: "shuhe",
    name: "束河古镇",
    nameEn: "Shuhe Ancient Town",
    location: "丽江市",
    image: "🏔️",
    rating: 4.8,
    tags: ["纳西文化", "茶马古道", "慢生活"],
    tagsEn: ["Naxi Culture", "Tea Horse Road", "Slow Life"],
    description: "纳西族聚居地，茶马古道重镇，比丽江古城更宁静古朴。",
    descEn: "Naxi settlement and important town on the Tea Horse Road, quieter than Lijiang Old Town.",
    highlights: { rai: 85, cpi: 92, vsi: 89 },
    season: "春秋最佳",
    seasonEn: "Spring & Autumn",
    category: "culture",
    details: {
      activities: ["纳西古乐欣赏", "茶马古道徒步", "东巴文化体验", "古镇摄影", "特色民宿"],
      bestTime: "4-6月、9-10月",
      transport: "丽江古城出发约8公里",
      tips: "清晨和傍晚光线最佳，适合摄影",
    },
    visitors: 22340,
    reviewCount: 567,
    latitude: 26.905,
    longitude: 100.215,
    elevation: 2410,
    terrain: "valley",
  },
];

// 贵州省特色乡村
export const guizhouVillages: Village[] = [
  {
    id: "xijiang",
    name: "西江千户苗寨",
    nameEn: "Xijiang Miao Village",
    location: "雷山县",
    image: "🏛️",
    rating: 4.8,
    tags: ["苗族文化", "吊脚楼", "夜景璀璨"],
    tagsEn: ["Miao Culture", "Stilt Houses", "Night View"],
    description: "世界最大的苗族聚居村寨，吊脚楼层层叠叠，夜景如梦如幻。",
    descEn: "World's largest Miao settlement with layered stilt houses and dreamy night views.",
    highlights: { rai: 88, cpi: 95, vsi: 90 },
    season: "苗年(农历十月)",
    seasonEn: "Miao New Year (Lunar Oct)",
    category: "culture",
    details: {
      activities: ["苗族歌舞表演", "长桌宴", "吊脚楼民宿", "银饰锻造体验", "观景台夜景"],
      bestTime: "苗年期间或7-9月",
      transport: "贵阳出发约3小时车程",
      tips: "建议住一晚看夜景，体验苗族长桌宴",
    },
    visitors: 31250,
    reviewCount: 892,
    latitude: 26.496,
    longitude: 108.172,
    elevation: 850,
    terrain: "mountain",
  },
];

// 广西壮族自治区特色乡村
export const guangxiVillages: Village[] = [
  {
    id: "longji",
    name: "龙脊梯田",
    nameEn: "Longji Rice Terraces",
    location: "龙胜县",
    image: "🌾",
    rating: 4.9,
    tags: ["梯田景观", "壮族瑶族", "农耕文化"],
    tagsEn: ["Rice Terraces", "Zhuang & Yao", "Farming Culture"],
    description: "世界梯田之冠，壮族瑶族世代耕耘的杰作，四季景色各异。",
    descEn: "World's finest rice terraces, masterpiece of Zhuang and Yao generations.",
    highlights: { rai: 94, cpi: 91, vsi: 96 },
    season: "灌水期(5-6月)、金秋(9-10月)",
    seasonEn: "Irrigation (May-Jun), Golden Autumn (Sep-Oct)",
    category: "nature",
    details: {
      activities: ["梯田日出", "壮族家访", "徒步穿越", "农家住宿", "摄影创作"],
      bestTime: "5-6月灌水期、9-10月收割前",
      transport: "桂林出发约2小时车程",
      tips: "建议住寨子里，清晨看日出最佳",
    },
    visitors: 28760,
    reviewCount: 756,
    latitude: 25.716,
    longitude: 110.12,
    elevation: 800,
    terrain: "mountain",
  },
];

// 湖南省特色乡村
export const hunanVillages: Village[] = [
  {
    id: "fenghuang",
    name: "凤凰古城",
    nameEn: "Fenghuang Ancient Town",
    location: "凤凰县",
    image: "🏛️",
    rating: 4.8,
    tags: ["苗族土家族", "吊脚楼", "沱江夜景"],
    tagsEn: ["Miao & Tujia", "Stilt Houses", "Tuo River Night"],
    description: "沈从文笔下的边城，苗族土家族文化交融，沱江穿城而过。",
    descEn: "Border town in Shen Congwen's writing, Miao and Tujia cultural blend.",
    highlights: { rai: 90, cpi: 93, vsi: 91 },
    season: "春秋最佳",
    seasonEn: "Spring & Autumn",
    category: "culture",
    details: {
      activities: ["沱江泛舟", "古城漫步", "苗族银饰", "吊脚楼酒吧", "篝火晚会"],
      bestTime: "3-5月、9-11月",
      transport: "吉首出发约1小时车程",
      tips: "夜景非常美，建议住江边吊脚楼",
    },
    visitors: 29870,
    reviewCount: 834,
    latitude: 27.95,
    longitude: 109.6,
    elevation: 320,
    terrain: "valley",
  },
];

// 浙江省特色乡村
export const zhejiangVillages: Village[] = [
  {
    id: "wuzhen",
    name: "乌镇",
    nameEn: "Wuzhen",
    location: "桐乡市",
    image: "🏘️",
    rating: 4.8,
    tags: ["江南水乡", "互联网大会", "古镇典范"],
    tagsEn: ["Jiangnan Water Town", "Internet Conference", "Ancient Town Model"],
    description: "中国最后的枕水人家，世界互联网大会永久会址，江南水乡典范。",
    descEn: "China's last riverside dwelling, permanent venue of World Internet Conference.",
    highlights: { rai: 92, cpi: 94, vsi: 93 },
    season: "春秋最佳",
    seasonEn: "Spring & Autumn",
    category: "culture",
    details: {
      activities: ["东栅西栅游览", "乌篷船体验", "蓝印花布", "互联网大会会址", "夜游水乡"],
      bestTime: "3-5月、9-11月",
      transport: "杭州出发约1.5小时车程",
      tips: "建议住一晚，体验水乡夜景和清晨",
    },
    visitors: 38760,
    reviewCount: 967,
    latitude: 30.74,
    longitude: 120.48,
    elevation: 8,
    terrain: "plain",
  },
];

// 安徽省特色乡村
export const anhuiVillages: Village[] = [
  {
    id: "hongcun",
    name: "宏村",
    nameEn: "Hongcun",
    location: "黟县",
    image: "🏛️",
    rating: 4.9,
    tags: ["徽派建筑", "画里乡村", "世界遗产"],
    tagsEn: ["Hui Architecture", "Village in Painting", "World Heritage"],
    description: "中国画里的乡村，徽派建筑典范，世界文化遗产，卧虎藏龙取景地。",
    descEn: "Village in Chinese painting, Hui architecture model, World Heritage site.",
    highlights: { rai: 91, cpi: 96, vsi: 92 },
    season: "春秋最佳",
    seasonEn: "Spring & Autumn",
    category: "culture",
    details: {
      activities: ["月沼晨雾", "南湖画桥", "承志堂", "徽派民居", "写生摄影"],
      bestTime: "3-4月油菜花、10-11月秋色",
      transport: "黄山市区出发约1小时车程",
      tips: "清晨6-7点月沼有晨雾，非常美",
    },
    visitors: 26780,
    reviewCount: 678,
    latitude: 30.0,
    longitude: 117.98,
    elevation: 180,
    terrain: "hill",
  },
];

// 江西省特色乡村
export const jiangxiVillages: Village[] = [
  {
    id: "wuyuan",
    name: "婺源",
    nameEn: "Wuyuan",
    location: "上饶市",
    image: "🌼",
    rating: 4.9,
    tags: ["油菜花", "徽派建筑", "最美乡村"],
    tagsEn: ["Rape Flowers", "Hui Architecture", "Most Beautiful Village"],
    description: "中国最美乡村，油菜花盛开时节如梦如幻，徽派建筑遍布。",
    descEn: "China's most beautiful village, dreamy during rape flower season.",
    highlights: { rai: 95, cpi: 92, vsi: 96 },
    season: "3-4月油菜花、11月红枫",
    seasonEn: "Mar-Apr rape flowers, Nov red maples",
    category: "nature",
    details: {
      activities: ["油菜花海", "篁岭晒秋", "江岭梯田", "徽派古村", "摄影创作"],
      bestTime: "3月中旬-4月上旬油菜花",
      transport: "上饶出发约1.5小时车程",
      tips: "油菜花季人很多，建议提前预订住宿",
    },
    visitors: 45680,
    reviewCount: 1234,
    latitude: 29.25,
    longitude: 117.86,
    elevation: 150,
    terrain: "hill",
  },
];

// 福建省特色乡村
export const fujianVillages: Village[] = [
  {
    id: "tulou",
    name: "福建土楼",
    nameEn: "Fujian Tulou",
    location: "永定县",
    image: "🏛️",
    rating: 4.8,
    tags: ["客家文化", "土楼建筑", "世界遗产"],
    tagsEn: ["Hakka Culture", "Tulou Architecture", "World Heritage"],
    description: "东方建筑明珠，客家文化象征，世界文化遗产，大鱼海棠取景地。",
    descEn: "Pearl of Eastern architecture, symbol of Hakka culture, World Heritage.",
    highlights: { rai: 87, cpi: 96, vsi: 89 },
    season: "四季皆宜",
    seasonEn: "All Seasons",
    category: "culture",
    details: {
      activities: ["承启楼", "振成楼", "客家美食", "土楼民宿", "客家歌舞"],
      bestTime: "春秋最佳",
      transport: "龙岩出发约1.5小时车程",
      tips: "建议住土楼内，体验客家生活",
    },
    visitors: 23450,
    reviewCount: 678,
    latitude: 24.72,
    longitude: 116.95,
    elevation: 380,
    terrain: "hill",
  },
];

// 四川省特色乡村
export const sichuanVillages: Village[] = [
  {
    id: "jiuzhaigou",
    name: "九寨沟",
    nameEn: "Jiuzhaigou",
    location: "九寨沟县",
    image: "🏔️",
    rating: 4.9,
    tags: ["童话世界", "彩池瀑布", "藏族风情"],
    tagsEn: ["Fairyland", "Colorful Pools", "Tibetan Style"],
    description: "童话世界，人间仙境，九寨归来不看水，藏族风情浓郁。",
    descEn: "Fairyland on earth, no need to see other waters after Jiuzhaigou.",
    highlights: { rai: 97, cpi: 93, vsi: 96 },
    season: "9-11月秋色最美",
    seasonEn: "Sep-Nov autumn colors",
    category: "nature",
    details: {
      activities: ["五花海", "诺日朗瀑布", "长海", "藏族村寨", "原始森林"],
      bestTime: "9月下旬-10月",
      transport: "成都出发约8小时车程或飞九黄机场",
      tips: "海拔较高，注意高原反应，建议游玩2天",
    },
    visitors: 38970,
    reviewCount: 1023,
    latitude: 33.26,
    longitude: 103.92,
    elevation: 2000,
    terrain: "mountain",
  },
];

// 导出所有扩展的村落数据
export const extendedVillages: Village[] = [
  ...yunnanVillages,
  ...guizhouVillages,
  ...guangxiVillages,
  ...hunanVillages,
  ...zhejiangVillages,
  ...anhuiVillages,
  ...jiangxiVillages,
  ...fujianVillages,
  ...sichuanVillages,
];

// 按省份分组的村落数据
export const villagesByProvince: Record<string, Village[]> = {
  "云南": yunnanVillages,
  "贵州": guizhouVillages,
  "广西": guangxiVillages,
  "湖南": hunanVillages,
  "浙江": zhejiangVillages,
  "安徽": anhuiVillages,
  "江西": jiangxiVillages,
  "福建": fujianVillages,
  "四川": sichuanVillages,
};

// 省份列表
export const provinceList = [
  { name: "广东", nameEn: "Guangdong", count: 5 },
  { name: "云南", nameEn: "Yunnan", count: 2 },
  { name: "贵州", nameEn: "Guizhou", count: 1 },
  { name: "广西", nameEn: "Guangxi", count: 1 },
  { name: "湖南", nameEn: "Hunan", count: 1 },
  { name: "浙江", nameEn: "Zhejiang", count: 1 },
  { name: "安徽", nameEn: "Anhui", count: 1 },
  { name: "江西", nameEn: "Jiangxi", count: 1 },
  { name: "福建", nameEn: "Fujian", count: 1 },
  { name: "四川", nameEn: "Sichuan", count: 1 },
];
