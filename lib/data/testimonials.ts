export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  contentEn: string;
  rating: number;
  createdAt: string;
}

let testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "李阿姨",
    role: "广州退休教师",
    content: "带着70岁老伴去千年瑶寨，AI自动规划了平坦路线，还标注了厕所和休息点。瑶族药浴太舒服了！以前不敢去乡村，现在完全放心。",
    contentEn: "Took my 70-year-old spouse to the Yao village. AI planned flat routes and marked restrooms. The Yao herbal bath was amazing!",
    rating: 5,
    createdAt: "2025-12-01",
  },
  {
    id: "t2",
    name: "张先生",
    role: "深圳程序员 · 带娃出行",
    content: "30秒就生成了3天亲子行程，考虑了5岁孩子的体力。小智还用粤语给我讲了瑶族的长鼓舞故事，儿子听得入迷！",
    contentEn: "Generated a 3-day family trip in 30 seconds, considering my 5-year-old's stamina. The AI guide told Yao drum dance stories in Cantonese!",
    rating: 5,
    createdAt: "2025-11-20",
  },
  {
    id: "t3",
    name: "王老师",
    role: "高校文旅研究员",
    content: "文化保护指数(CPI)和社区受益追踪(CBT)让我眼前一亮。这不只是旅游App，更是乡村振兴的数字化工具。论文已引用。",
    contentEn: "CPI and CBT impressed me. This isn't just a tourism app—it's a digital tool for rural revitalization. Already cited in my paper.",
    rating: 5,
    createdAt: "2025-11-15",
  },
  {
    id: "t4",
    name: "陈村长",
    role: "连南瑶寨村干部",
    content: "自从接入平台，游客知道我们的节庆活动了。盘王节期间订单增长了3倍，村民收入透明可查，年轻人也开始回来了。",
    contentEn: "Since joining the platform, tourists know about our festivals. Orders tripled during Pan Wang Festival, income is transparent, youth are returning.",
    rating: 5,
    createdAt: "2025-10-28",
  },
  {
    id: "t5",
    name: "刘同学",
    role: "大学生背包客",
    content: "以前只知道去网红景点排队，现在发现了好多小众村落！口碑分算法真的靠谱，推荐的积庆里茶园超级安静。",
    contentEn: "Used to only visit overcrowded tourist spots. Now I discover hidden gems! The reputation algorithm recommended Jiqingli tea garden—super peaceful.",
    rating: 4,
    createdAt: "2025-10-15",
  },
  {
    id: "t6",
    name: "赵导游",
    role: "清远持证导游",
    content: "数字人伴游功能太强了，连瑶语都能理解。游客问到油岭瑶寨的耍歌堂历史，AI比我讲得还详细，我都学到新知识了。",
    contentEn: "The AI guide is incredible—it even understands Yao dialect. When tourists asked about Song Hall history, the AI knew more than me!",
    rating: 5,
    createdAt: "2025-10-10",
  },
  {
    id: "t7",
    name: "何女士",
    role: "佛山摄影爱好者",
    content: "AI推荐了英西峰林日出最佳机位，还告诉我雨后初晴去效果最好。拍出来的照片获了省摄影赛银奖！",
    contentEn: "AI recommended the best sunrise spot at Yingxi Peaks, and suggested going after rain clears. My photo won a provincial silver award!",
    rating: 5,
    createdAt: "2025-09-28",
  },
  {
    id: "t8",
    name: "杨大哥",
    role: "东莞自驾游达人",
    content: "实景地图导航太实用了，山路弯道提前提醒，还能看到实时路况。油岭瑶寨的路虽然窄但完全能开，VSI安全指数给了我信心。",
    contentEn: "Live map navigation is incredibly useful—advance curve warnings and real-time road conditions. VSI safety index gave me confidence on narrow roads.",
    rating: 5,
    createdAt: "2025-09-20",
  },
  {
    id: "t9",
    name: "林小姐",
    role: "香港游客",
    content: "第一次来清远乡村游，粤语沟通完全没问题！小智用粤语讲解客家围屋的故事，感觉像有个本地朋友带路一样自然。",
    contentEn: "First time visiting Qingyuan villages. Cantonese communication was seamless! The AI explained Hakka houses in Cantonese—like having a local friend.",
    rating: 5,
    createdAt: "2025-09-15",
  },
  {
    id: "t10",
    name: "周老板",
    role: "上岳古村民宿经营者",
    content: "CBT系统让每笔收入都透明，游客信任度提高了。平台引流后入住率涨了40%，还吸引了两个年轻人回村创业。",
    contentEn: "CBT system makes every transaction transparent. Occupancy up 40% after platform referrals, and two young people returned to start businesses.",
    rating: 5,
    createdAt: "2025-09-08",
  },
];

export function getTestimonials() {
  return testimonials;
}

export function addTestimonial(t: Omit<Testimonial, "id" | "createdAt">) {
  const newT: Testimonial = { ...t, id: `t${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] };
  testimonials = [newT, ...testimonials];
  return newT;
}
