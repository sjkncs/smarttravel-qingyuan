export interface ForumComment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
}

export interface ForumPost {
  id: number;
  type: "question" | "guide" | "review" | "discussion";
  title: string;
  content: string;
  author: string;
  authorRole: string;
  avatar: string;
  time: string;
  votes: number;
  views: number;
  commentCount: number;
  tags: string[];
  aiSummary?: string;
  comments: ForumComment[];
}

let posts: ForumPost[] = [
  {
    id: 1,
    type: "guide",
    title: "清远3天2晚深度游攻略｜AI帮我规划了完美路线！",
    content: "分享一下上周的清远之旅！使用智游清远的AI规划功能，30秒就生成了完美行程：\n\nDay1：峰林小镇 → 温泉度假\nDay2：南岗千年瑶寨 → 瑶族药浴\nDay3：积庆里茶园 → 英德红茶品鉴\n\n最惊喜的是AI自动避开了周末人流高峰，推荐了工作日出发，门票还便宜30%！\n\n实景地图导航在山路上太好用了，弯道提前提醒，完全不慌。强烈推荐！",
    author: "旅行达人小美",
    authorRole: "资深旅行博主 · 10万粉丝",
    avatar: "✈️",
    time: "2小时前",
    votes: 528,
    views: 3240,
    commentCount: 42,
    tags: ["攻略分享", "AI规划", "清远"],
    aiSummary: "这是一篇清远3天2晚深度游攻略，作者使用AI规划功能生成了涵盖峰林小镇、千年瑶寨和积庆里茶园的行程。亮点包括：AI避开人流高峰的智能推荐、实景地图的山路导航体验。",
    comments: [
      { id: 101, author: "清远本地人", avatar: "🏠", content: "推荐加上上岳古村，锅耳墙建筑群很有特色！距离峰林小镇不远。", time: "1小时前", likes: 45 },
      { id: 102, author: "带娃旅行家", avatar: "👨‍👩‍👧", content: "请问带5岁孩子适合这个行程吗？瑶寨的路好走吗？", time: "30分钟前", likes: 12 },
    ],
  },
  {
    id: 2,
    type: "review",
    title: "千年瑶寨深度体验测评：数字人导游让我哭了",
    content: "作为一个文旅从业者，我对「数字人」一直持怀疑态度。但这次在千年瑶寨的体验彻底改变了我的看法。\n\n数字人「小智」不仅能用普通话讲解，还能切换粤语和基础瑶语！当它用瑶语唱起了一段迎客歌，旁边的瑶族阿婆眼眶都红了。\n\n文化保护指数(CPI)显示这里的非遗保护做得很好，传承人有12位，其中3位是年轻人。这让我看到了希望。\n\nCBT系统让我能看到每一笔消费中有多少流向了当地村民，这种透明度是我在其他平台从未见过的。",
    author: "文旅观察者阿凯",
    authorRole: "文旅自媒体 · 5年从业经验",
    avatar: "📝",
    time: "5小时前",
    votes: 892,
    views: 5680,
    commentCount: 67,
    tags: ["深度测评", "数字人", "瑶族文化", "CBT"],
    aiSummary: "文旅从业者对千年瑶寨数字人导游的深度测评。核心观点：数字人多语言能力（含瑶语）令人惊喜；CPI指数显示非遗保护成效显著；CBT透明度是行业领先特色。",
    comments: [
      { id: 201, author: "瑶族小妹", avatar: "🎭", content: "谢谢关注我们的文化！那位阿婆是我奶奶，她说很久没听到年轻人唱迎客歌了。数字人帮我们传承文化。", time: "4小时前", likes: 234 },
    ],
  },
  {
    id: 3,
    type: "question",
    title: "VSI安全指数怎么看？油岭瑶寨的山路安全吗？",
    content: "计划下周自驾去油岭瑶寨，但看到地图上显示山路比较多。\n\n请问：\n1. VSI安全指数82分是什么水平？\n2. 雨天适合去吗？\n3. 需要什么车型？普通轿车可以吗？\n4. 有没有替代路线？",
    author: "自驾新手小王",
    authorRole: "广州白领 · 驾龄1年",
    avatar: "🚗",
    time: "1天前",
    votes: 156,
    views: 1890,
    commentCount: 23,
    tags: ["自驾", "安全", "油岭瑶寨"],
    comments: [
      { id: 301, author: "老司机阿强", avatar: "🏎️", content: "VSI 82分属于良好水平！普通轿车完全OK，就是有几个急弯要注意减速。建议用APP的实景导航，弯道会提前提醒。雨天路面有点滑，小心驾驶就行。", time: "20小时前", likes: 89 },
    ],
  },
  {
    id: 4,
    type: "discussion",
    title: "讨论：AI推荐的小众村落真的靠谱吗？聊聊你的体验",
    content: "用智游清远APP的村落发现引擎快半年了，分享几个感受：\n\n1. 口碑分算法推荐的确实比网上热门攻略靠谱，去了几个冷门村子都很惊喜\n2. RAI指数很实用，提前知道路况和信号覆盖\n3. CPI文化保护指数帮我找到了很多原生态的文化体验\n\n但也有疑问：\n- 算法会不会有bias？比如新开发的村落数据少就排不上来？\n- 口碑分的数据来源是什么？",
    author: "数据控旅行者",
    authorRole: "产品经理 · 深度用户",
    avatar: "📊",
    time: "3天前",
    votes: 312,
    views: 2156,
    commentCount: 27,
    tags: ["产品讨论", "算法", "村落发现"],
    aiSummary: "社区讨论集中在智游清远的村落推荐算法可靠性。多数用户认为口碑分算法推荐质量高于传统攻略。关于数据bias问题，官方回复称采用冷启动策略+专家初评来解决新村落数据不足的问题。",
    comments: [
      { id: 401, author: "智游清远官方", avatar: "🏔️", content: "感谢反馈！关于算法bias的问题：我们采用了「冷启动」策略，新接入的村落会由文旅专家进行初评打分，同时结合官方数据（如文旅局评级、基础设施数据），确保新村落也能获得合理的初始排名。", time: "2天前", likes: 189 },
    ],
  },
  {
    id: 5,
    type: "question",
    title: "瑶族盘王节什么时候？有什么特别的仪式？想去体验！",
    content: "听说连南瑶族的盘王节非常壮观，想了解：\n1. 具体是什么时间？每年都有吗？\n2. 游客可以参与哪些活动？\n3. 需要提前预约吗？\n4. 有什么禁忌需要注意的？",
    author: "文化探索者小陈",
    authorRole: "大学生 · 民俗学专业",
    avatar: "📚",
    time: "1周前",
    votes: 198,
    views: 1523,
    commentCount: 15,
    tags: ["民俗文化", "盘王节", "瑶族"],
    comments: [
      { id: 501, author: "瑶文化研究者", avatar: "🎓", content: "盘王节是农历十月十六日，每年都有！核心仪式包括：祭祀盘王、长鼓舞表演、瑶歌对唱、篝火晚会等。游客可以参与长鼓舞体验和篝火晚会。需要尊重祭祀仪式，部分区域禁止拍摄，建议跟随导游。", time: "6天前", likes: 132 },
    ],
  },
];

export function getPosts() {
  return posts;
}

export function getPostById(id: number) {
  return posts.find((p) => p.id === id) || null;
}

export function getPostsByCategory(category: string) {
  if (category === "all") return posts;
  return posts.filter((p) => p.type === category);
}

export function addPost(post: Omit<ForumPost, "id" | "votes" | "views" | "commentCount" | "comments">) {
  const newPost: ForumPost = {
    ...post,
    id: Date.now(),
    votes: 0,
    views: 0,
    commentCount: 0,
    comments: [],
  };
  posts = [newPost, ...posts];
  return newPost;
}

export function addComment(postId: number, comment: Omit<ForumComment, "id" | "likes">) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  const newComment: ForumComment = { ...comment, id: Date.now(), likes: 0 };
  post.comments.push(newComment);
  post.commentCount += 1;
  return newComment;
}

export function votePost(postId: number, delta: number) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;
  post.votes += delta;
  return post;
}
