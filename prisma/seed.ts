import { PrismaClient } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ═══ DEMO USER ═══
  const hashedPassword = await bcrypt.hash("demo123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { phone: "18856008931" },
    update: {},
    create: {
      phone: "18856008931",
      email: "2797660051@qq.com",
      password: hashedPassword,
      name: "演示用户",
      avatar: "🧑",
      role: "USER",
    },
  });
  console.log("✅ Demo user created:", demoUser.id);

  // ═══ ADMIN USER ═══
  const adminPassword = await bcrypt.hash("admin@smarttravel2026", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@smarttravel.com" },
    update: {},
    create: {
      email: "admin@smarttravel.com",
      password: adminPassword,
      name: "管理员",
      avatar: "👨‍💼",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", adminUser.id);

  // ═══ VILLAGES ═══
  const villagesData = [
    {
      slug: "fenglin",
      name: "峰林小镇",
      nameEn: "Fenglin Town",
      location: "英德市",
      image: "🏔️",
      rating: 4.8,
      tags: ["喀斯特峰林", "田园风光", "温泉度假"],
      tagsEn: ["Karst Peaks", "Pastoral", "Hot Springs"],
      description: "英西峰林走廊核心区，千座石灰岩峰林环绕，田园牧歌式乡村体验，被誉为「广东小桂林」。",
      descEn: "Core area of Yingxi Karst Corridor, surrounded by thousands of limestone peaks, known as 'Little Guilin of Guangdong'.",
      raiScore: 92, cpiScore: 78, vsiScore: 95,
      season: "四季皆宜", seasonEn: "All Seasons",
      category: "nature", visitors: 15820, reviewCount: 342,
      detail: {
        create: {
          activities: ["徒步观峰", "竹筏漂流", "温泉养生", "田园采摘", "星空露营"],
          bestTime: "3-5月、9-11月",
          transport: "广州出发约2.5小时车程",
          tips: "建议穿运动鞋，带防晒用品",
        },
      },
    },
    {
      slug: "nangang",
      name: "南岗千年瑶寨",
      nameEn: "Nangang Yao Village",
      location: "连南瑶族自治县",
      image: "🏛️",
      rating: 4.9,
      tags: ["瑶族文化", "非遗传承", "古建筑群"],
      tagsEn: ["Yao Culture", "Intangible Heritage", "Ancient Architecture"],
      description: "全国规模最大的瑶族古寨，千年排瑶历史，长鼓舞、耍歌堂等国家级非遗活态传承地。",
      descEn: "China's largest Yao ancient village with thousand-year Pai Yao history and national intangible heritage.",
      raiScore: 75, cpiScore: 98, vsiScore: 88,
      season: "盘王节(农历十月)", seasonEn: "Pan Wang Festival (Lunar October)",
      category: "culture", visitors: 23150, reviewCount: 567,
      detail: {
        create: {
          activities: ["瑶族歌舞观赏", "长鼓舞体验", "瑶族服饰试穿", "瑶药药浴", "篝火晚会"],
          bestTime: "盘王节期间(农历十月十六)",
          transport: "广州出发约4小时车程",
          tips: "尊重瑶族习俗，拍照前请询问",
        },
      },
    },
    {
      slug: "shangyue",
      name: "上岳古村",
      nameEn: "Shangyue Village",
      location: "佛冈县",
      image: "🏘️",
      rating: 4.6,
      tags: ["广府古村", "锅耳墙", "宗祠文化"],
      tagsEn: ["Cantonese Village", "Wok-ear Walls", "Ancestral Halls"],
      description: "保存最完整的广府古村落之一，始建于南宋，拥有独特锅耳墙建筑群和深厚宗祠文化。",
      descEn: "One of the best-preserved Cantonese villages, founded in Southern Song Dynasty with unique wok-ear wall architecture.",
      raiScore: 88, cpiScore: 85, vsiScore: 92,
      season: "春秋最佳", seasonEn: "Spring & Autumn",
      category: "heritage", visitors: 9870, reviewCount: 198,
      detail: {
        create: {
          activities: ["古建筑参观", "宗祠文化体验", "书法体验", "农家美食", "古村摄影"],
          bestTime: "3-5月、10-12月",
          transport: "广州出发约1.5小时车程",
          tips: "古建筑请勿触摸，保持安静",
        },
      },
    },
    {
      slug: "youling",
      name: "油岭瑶寨",
      nameEn: "Youling Yao Village",
      location: "连南瑶族自治县",
      image: "🎭",
      rating: 4.7,
      tags: ["瑶族歌舞", "耍歌堂", "原生态"],
      tagsEn: ["Yao Dance", "Song Hall", "Eco-authentic"],
      description: "「中国瑶族第一寨」，耍歌堂发源地，保留最原生态的排瑶生活方式与歌舞传统。",
      descEn: "'China's First Yao Village', birthplace of Song Hall ceremony, preserving authentic Pai Yao lifestyle.",
      raiScore: 68, cpiScore: 96, vsiScore: 82,
      season: "开耕节(农历三月)", seasonEn: "Plowing Festival (Lunar March)",
      category: "culture", visitors: 12340, reviewCount: 276,
      detail: {
        create: {
          activities: ["耍歌堂仪式", "瑶族山歌对唱", "刺绣体验", "原生态徒步", "民俗摄影"],
          bestTime: "开耕节/盘王节期间",
          transport: "广州出发约4.5小时车程",
          tips: "山路较陡，建议穿防滑鞋",
        },
      },
    },
    {
      slug: "jiqingli",
      name: "积庆里",
      nameEn: "Jiqingli",
      location: "英德市",
      image: "🍵",
      rating: 4.5,
      tags: ["红茶文化", "茶园观光", "客家风情"],
      tagsEn: ["Black Tea", "Tea Garden", "Hakka Culture"],
      description: "英德红茶核心产区，百年茶文化传承地，集茶园观光、客家民俗、生态休闲于一体。",
      descEn: "Core Yingde black tea region, century-old tea culture heritage combining tea gardens, Hakka customs, and eco-leisure.",
      raiScore: 90, cpiScore: 72, vsiScore: 94,
      season: "采茶季(3-5月)", seasonEn: "Tea Season (Mar-May)",
      category: "nature", visitors: 8560, reviewCount: 156,
      detail: {
        create: {
          activities: ["茶园采茶", "制茶体验", "品茗鉴赏", "客家围屋参观", "乡村骑行"],
          bestTime: "3-5月采茶季",
          transport: "广州出发约2小时车程",
          tips: "采茶建议穿长袖，注意防蚊",
        },
      },
    },
  ];

  for (const v of villagesData) {
    await prisma.village.upsert({
      where: { slug: v.slug },
      update: {},
      create: v,
    });
  }
  console.log("✅ Villages seeded:", villagesData.length);

  // ═══ TESTIMONIALS ═══
  const testimonialsData = [
    { name: "李阿姨", role: "广州退休教师", content: "带着70岁老伴去千年瑶寨，AI自动规划了平坦路线，还标注了厕所和休息点。瑶族药浴太舒服了！", contentEn: "Took my 70-year-old spouse to the Yao village. AI planned flat routes and marked restrooms.", rating: 5, approved: true },
    { name: "张先生", role: "深圳程序员 · 带娃出行", content: "30秒就生成了3天亲子行程，考虑了5岁孩子的体力。小智还用粤语给我讲了瑶族的长鼓舞故事！", contentEn: "Generated a 3-day family trip in 30 seconds, considering my 5-year-old's stamina.", rating: 5, approved: true },
    { name: "王老师", role: "高校文旅研究员", content: "文化保护指数(CPI)和社区受益追踪(CBT)让我眼前一亮。这不只是旅游App，更是乡村振兴的数字化工具。", contentEn: "CPI and CBT impressed me. This isn't just a tourism app—it's a digital tool for rural revitalization.", rating: 5, approved: true },
    { name: "陈村长", role: "连南瑶寨村干部", content: "自从接入平台，游客知道我们的节庆活动了。盘王节期间订单增长了3倍，村民收入透明可查。", contentEn: "Since joining the platform, tourists know about our festivals. Orders tripled during Pan Wang Festival.", rating: 5, approved: true },
    { name: "刘同学", role: "大学生背包客", content: "以前只知道去网红景点排队，现在发现了好多小众村落！口碑分算法真的靠谱。", contentEn: "Used to only visit overcrowded tourist spots. Now I discover hidden gems!", rating: 4, approved: true },
    { name: "赵导游", role: "清远持证导游", content: "数字人伴游功能太强了，连瑶语都能理解。游客问到油岭瑶寨的耍歌堂历史，AI比我讲得还详细。", contentEn: "The AI guide is incredible—it even understands Yao dialect.", rating: 5, approved: true },
    { name: "何女士", role: "佛山摄影爱好者", content: "AI推荐了英西峰林日出最佳机位，还告诉我雨后初晴去效果最好。拍出来的照片获了省摄影赛银奖！", contentEn: "AI recommended the best sunrise spot at Yingxi Peaks. My photo won a provincial silver award!", rating: 5, approved: true },
    { name: "杨大哥", role: "东莞自驾游达人", content: "实景地图导航太实用了，山路弯道提前提醒，还能看到实时路况。VSI安全指数给了我信心。", contentEn: "Live map navigation is incredibly useful—advance curve warnings and real-time road conditions.", rating: 5, approved: true },
    { name: "林小姐", role: "香港游客", content: "第一次来清远乡村游，粤语沟通完全没问题！小智用粤语讲解客家围屋的故事，感觉像有个本地朋友带路。", contentEn: "First time visiting Qingyuan villages. Cantonese communication was seamless!", rating: 5, approved: true },
    { name: "周老板", role: "上岳古村民宿经营者", content: "CBT系统让每笔收入都透明，游客信任度提高了。平台引流后入住率涨了40%。", contentEn: "CBT system makes every transaction transparent. Occupancy up 40% after platform referrals.", rating: 5, approved: true },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({ data: t });
  }
  console.log("✅ Testimonials seeded:", testimonialsData.length);

  // ═══ PLATFORM STATS ═══
  const statsData = [
    { key: "visitors", value: 8, suffix: "亿+", label: "2024年乡村游客人次", labelEn: "Rural Tourists 2024" },
    { key: "satisfaction", value: 91, suffix: "%", label: "用户满意度", labelEn: "User Satisfaction" },
    { key: "ai_speed", value: 30, suffix: "秒", label: "AI行程生成", labelEn: "AI Trip Generation" },
    { key: "innovations", value: 12, suffix: "项", label: "独创技术创新", labelEn: "Tech Innovations" },
  ];

  for (const s of statsData) {
    await prisma.platformStat.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Platform stats seeded:", statsData.length);

  // ═══ FORUM POSTS ═══
  const post1 = await prisma.forumPost.create({
    data: {
      type: "GUIDE",
      title: "清远3天2晚深度游攻略｜AI帮我规划了完美路线！",
      content: "分享一下上周的清远之旅！使用智游清远的AI规划功能，30秒就生成了完美行程：\n\nDay1：峰林小镇 → 温泉度假\nDay2：南岗千年瑶寨 → 瑶族药浴\nDay3：积庆里茶园 → 英德红茶品鉴\n\n最惊喜的是AI自动避开了周末人流高峰，推荐了工作日出发，门票还便宜30%！",
      authorId: demoUser.id,
      authorName: "旅行达人小美",
      authorRole: "资深旅行博主 · 10万粉丝",
      authorAvatar: "✈️",
      votes: 528,
      views: 3240,
      tags: ["攻略分享", "AI规划", "清远"],
      aiSummary: "这是一篇清远3天2晚深度游攻略，涵盖峰林小镇、千年瑶寨和积庆里茶园的行程。",
    },
  });

  await prisma.forumComment.create({
    data: {
      postId: post1.id,
      authorId: demoUser.id,
      authorName: "清远本地人",
      authorAvatar: "🏠",
      content: "推荐加上上岳古村，锅耳墙建筑群很有特色！距离峰林小镇不远。",
      likes: 45,
    },
  });
  console.log("✅ Forum posts seeded");

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
