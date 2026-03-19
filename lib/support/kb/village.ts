import type { SupportKBEntry } from "../knowledge-base";

export const VILLAGE_KB: SupportKBEntry[] = [
  {
    id: "vil-001", category: "village", subcategory: "概览", priority: 9,
    question: "清远有哪些推荐村落？",
    answer: "5大核心村落：1.峰林小镇(英德)—喀斯特峰林温泉 2.南岗千年瑶寨(连南)—瑶族非遗 3.上岳古村(佛冈)—广府锅耳墙 4.油岭瑶寨(连南)—耍歌堂发源地 5.积庆里(英德)—英德红茶客家文化",
    keywords: ["村落", "推荐", "景点", "哪些村落", "去哪玩"],
  },
  {
    id: "vil-002", category: "village", subcategory: "峰林小镇", priority: 8,
    question: "峰林小镇有什么好玩的？",
    answer: "峰林小镇(英德)：喀斯特峰林地貌，海拔120m。必玩：峰林日出、天然温泉(¥128-298)、骑行绿道(10km)、竹筏漂流、千军峰林摄影。免费入园，建议1-2天。",
    keywords: ["峰林小镇", "峰林", "英德", "温泉", "峰林走廊"],
  },
  {
    id: "vil-003", category: "village", subcategory: "南岗瑶寨", priority: 8,
    question: "南岗千年瑶寨怎么样？",
    answer: "南岗千年瑶寨(连南)：中国最古老瑶寨，国家非遗。海拔803m。必看：古建筑群、瑶族歌舞(每日10:00/15:00)、盘王节(农历十月十六)、瑶族服饰体验。门票¥60-80。⚠️宗教区禁拍照。",
    keywords: ["瑶寨", "南岗", "连南", "瑶族", "千年瑶寨", "盘王节"],
  },
  {
    id: "vil-004", category: "village", subcategory: "上岳古村", priority: 8,
    question: "上岳古村有什么特色？",
    answer: "上岳古村(佛冈)：广府锅耳墙建筑博物馆，明清古建筑群。海拔45m，免费入园。广州1.5h车程。最适合亲子游、摄影、老年人。最佳拍摄光线下午3-5点。",
    keywords: ["上岳", "古村", "佛冈", "锅耳墙", "广府建筑"],
  },
  {
    id: "vil-005", category: "village", subcategory: "油岭瑶寨", priority: 7,
    question: "油岭瑶寨和南岗瑶寨有什么区别？",
    answer: "油岭更原生态(耍歌堂发源地，游客少，¥40-60)；南岗更成熟(最古老瑶寨，设施完善，¥60-80)。相距8km可联游。两寨同属连南县，建议各半天。",
    keywords: ["油岭", "油岭瑶寨", "区别", "耍歌堂", "原生态"],
  },
  {
    id: "vil-006", category: "village", subcategory: "积庆里", priority: 7,
    question: "积庆里有什么好玩的？",
    answer: "积庆里(英德)：英德红茶故乡，客家文化。免费入园。必玩：茶园采摘(3-10月)、制茶参观、客家围屋、客家美食(酿豆腐/梅菜扣肉)。特产英红九号¥100-500/斤。",
    keywords: ["积庆里", "英德红茶", "客家", "茶园", "英红九号"],
  },
  {
    id: "vil-007", category: "village", subcategory: "文化", priority: 7,
    question: "瑶族有哪些文化禁忌需要注意？",
    answer: "1.宗教仪式区禁止拍照 2.不可随意穿戴瑶族宗教服饰 3.饮酒对歌是瑶族待客礼节应尊重参与 4.服饰禁忌：不可随意穿戴瑶族宗教服饰 5.跟随专业导游了解仪式含义 6.尊重当地居民隐私",
    keywords: ["瑶族", "禁忌", "文化", "注意事项", "礼仪", "尊重"],
  },
];
