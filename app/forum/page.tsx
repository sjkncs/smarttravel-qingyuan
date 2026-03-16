"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp, ChevronDown, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Search, TrendingUp, Clock, Star, Sparkles, Send, Heart, Eye,
  Filter, Plus, X, ThumbsUp, Loader2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
}

interface Post {
  id: number;
  type: "question" | "discussion" | "guide" | "review";
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
  comments: Comment[];
  aiSummary?: string;
  images?: string[];
  accepted?: boolean;
}

const initialPosts: Post[] = [
  {
    id: 1,
    type: "question",
    title: "带4岁宝宝去千年瑶寨，路况和设施怎么样？求有经验的分享！",
    content: "计划五一带娃去连南千年瑶寨，但是看到说山路比较陡，想问一下：\n\n1. 从广州出发自驾大概多久？路好开吗？\n2. 寨子里面有没有婴儿车能走的路？\n3. 厕所卫生条件怎么样？\n4. 附近住宿推荐？\n\n宝宝比较小，主要担心安全和便利性问题。谢谢各位！",
    author: "奶爸小林",
    authorRole: "亲子游达人 · 发帖32",
    avatar: "林",
    time: "2小时前",
    votes: 242,
    views: 1077,
    commentCount: 5,
    tags: ["亲子游", "千年瑶寨", "路况咨询"],
    accepted: true,
    aiSummary: "综合5条回答：千年瑶寨VSI安全指数88分（良好），广州自驾约4小时。寨内主道平坦可推婴儿车，但部分古建筑区有台阶。建议使用智游清远APP的「无障碍路线」功能。住宿推荐寨门口的瑶家客栈，卫生条件近年改善显著。",
    comments: [
      {
        id: 101,
        author: "瑶寨阿妹",
        avatar: "妹",
        content: "本地人来答！主道是平坦的石板路，婴儿车完全没问题。但是上山看古建筑那段有台阶，建议用背带。厕所翻新过了，干净的。寨门口有个「瑶家小院」很适合带娃住，老板娘特别热心，还给小朋友煮瑶族养生粥。",
        time: "1小时前",
        likes: 156,
      },
      {
        id: 102,
        author: "自驾游老王",
        avatar: "王",
        content: "上周刚去过。广州出发走广清高速+清连高速，大概3.5-4小时。最后30公里山路弯道多但路面OK，注意限速。建议错开节假日，平时人少体验更好。智游清远APP的实景导航很好用，弯道提前提醒。",
        time: "45分钟前",
        likes: 89,
      },
      {
        id: 103,
        author: "带娃去浪",
        avatar: "浪",
        content: "去年带3岁娃去的，整体体验不错！推荐用APP的AI规划功能，它自动帮我避开了台阶多的路线，还标注了休息点和厕所位置。长鼓舞表演小朋友超喜欢看！",
        time: "30分钟前",
        likes: 67,
      },
    ],
  },
  {
    id: 2,
    type: "guide",
    title: "【万字攻略】英西峰林走廊摄影全指南 — 8个绝佳机位 + 最佳时间",
    content: "作为一个拍了3年清远的摄影师，整理了这份英西峰林走廊的终极摄影攻略：\n\n**最佳拍摄时间**：日出(6:30-7:30)和日落(17:30-18:30)\n**最佳天气**：雨后初晴，云雾缭绕效果最佳\n**推荐镜头**：16-35mm广角 + 70-200mm长焦\n\n八大机位我在文中都标注了GPS坐标，配合智游清远的实景地图导航可以精准到达。\n\n上个月拍的几张已经投了省赛，分享给大家参考。",
    author: "峰林摄手阿杰",
    authorRole: "摄影师 · 获赞1.2k",
    avatar: "杰",
    time: "5小时前",
    votes: 876,
    views: 4523,
    commentCount: 38,
    tags: ["摄影攻略", "英西峰林", "精华帖"],
    aiSummary: "本文是清远英西峰林走廊的专业摄影指南，包含8个GPS定位机位、最佳拍摄时间、天气条件和器材推荐。作者为资深风光摄影师，内容经社区验证，可信度高。",
    comments: [
      {
        id: 201,
        author: "风光猎人",
        avatar: "猎",
        content: "太赞了！机位3那个角度我找了好久没找到，有了GPS坐标终于能精准到达了。配合APP的天气预报功能，可以提前规划拍摄日。",
        time: "3小时前",
        likes: 234,
      },
    ],
  },
  {
    id: 3,
    type: "review",
    title: "积庆里采茶体验真实测评 — 值不值得专程去？",
    content: "周末专程开车2小时去积庆里采茶，说下真实感受：\n\n✅ **优点**：\n- 茶园风景确实很美，梯田层叠\n- 制茶师傅很专业，讲解细致\n- 英德红茶品质没话说，现场品鉴很棒\n- APP推荐的路线避开了人多的区域\n\n❌ **不足**：\n- 周末人有点多\n- 采茶体验价格略贵（128元/人）\n- 停车位不太够\n\n整体评分：4.5/5，推荐指数：⭐⭐⭐⭐\n建议工作日去体验更好，用APP的「人流热力」功能可以提前看到人多不多。",
    author: "茶香小筑",
    authorRole: "茶文化爱好者 · 发帖18",
    avatar: "茶",
    time: "1天前",
    votes: 156,
    views: 892,
    commentCount: 12,
    tags: ["体验测评", "积庆里", "采茶"],
    comments: [
      {
        id: 301,
        author: "红茶控",
        avatar: "控",
        content: "同去过！补充一下，APP上显示的RAI可达性指数90分，路况确实不错。128元包含了采茶+制茶+品鉴全套，其实性价比还行。带走的茶叶单独买也不便宜。",
        time: "20小时前",
        likes: 45,
      },
    ],
  },
  {
    id: 4,
    type: "discussion",
    title: "讨论：AI推荐的小众村落真的靠谱吗？聊聊你的体验",
    content: "用智游清远APP的村落发现引擎快半年了，分享几个感受：\n\n1. 口碑分算法推荐的确实比网上热门攻略靠谱，去了几个冷门村子都很惊喜\n2. RAI指数很实用，提前知道路况和信号覆盖\n3. CPI文化保护指数帮我找到了很多原生态的文化体验\n\n但也有疑问：\n- 算法会不会有bias？比如新开发的村落数据少就排不上来？\n- 口碑分的数据来源是什么？\n\n想听听大家的体验和看法。",
    author: "数据控旅行者",
    authorRole: "产品经理 · 深度用户",
    avatar: "数",
    time: "3天前",
    votes: 312,
    views: 2156,
    commentCount: 27,
    tags: ["产品讨论", "算法", "村落发现"],
    aiSummary: "社区讨论集中在智游清远的村落推荐算法可靠性。多数用户认为口碑分算法推荐质量高于传统攻略。关于数据bias问题，官方回复称采用冷启动策略+专家初评来解决新村落数据不足的问题。",
    comments: [
      {
        id: 401,
        author: "智游清远官方",
        avatar: "官",
        content: "感谢反馈！关于算法bias的问题：我们采用了「冷启动」策略，新接入的村落会由文旅专家进行初评打分，同时结合官方数据（如文旅局评级、基础设施数据），确保新村落也能获得合理的初始排名。口碑分数据来源包括：用户评价、政府文旅数据、第三方OTA评分等多维度融合。",
        time: "2天前",
        likes: 189,
      },
    ],
  },
  {
    id: 5,
    type: "question",
    title: "瑶族盘王节什么时候？有什么特别的仪式？想去体验！",
    content: "听说连南瑶族的盘王节非常壮观，想了解：\n1. 具体是什么时间？每年都有吗？\n2. 游客可以参与哪些活动？\n3. 需要提前预约吗？\n4. 有什么禁忌需要注意的？",
    author: "文化探索者小陈",
    authorRole: "大学生 · 民俗学专业",
    avatar: "陈",
    time: "1周前",
    votes: 198,
    views: 1523,
    commentCount: 15,
    tags: ["民俗文化", "盘王节", "瑶族"],
    comments: [
      {
        id: 501,
        author: "瑶文化研究者",
        avatar: "研",
        content: "盘王节是农历十月十六日，每年都有！核心仪式包括：祭祀盘王、长鼓舞表演、瑶歌对唱、篝火晚会等。游客可以参与长鼓舞体验和篝火晚会。需要尊重祭祀仪式，部分区域禁止拍摄，建议跟随导游。APP里有详细的文化敏感提醒功能，很贴心。",
        time: "6天前",
        likes: 132,
      },
    ],
  },
];

const categories = [
  { id: "all", label: "全部", labelEn: "All", icon: "" },
  { id: "question", label: "问答", labelEn: "Q&A", icon: "" },
  { id: "guide", label: "攻略", labelEn: "Guides", icon: "" },
  { id: "review", label: "测评", labelEn: "Reviews", icon: "" },
  { id: "discussion", label: "讨论", labelEn: "Discussion", icon: "" },
];

const sortOptions = [
  { id: "hot", label: "最热", labelEn: "Hot", icon: TrendingUp },
  { id: "new", label: "最新", labelEn: "New", icon: Clock },
  { id: "top", label: "最赞", labelEn: "Top", icon: Star },
];

export default function ForumPage() {
  const { locale } = useI18n();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetch("/api/forum")
      .then((res) => res.json())
      .then((json) => { if (json.data) setPosts(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const [activeSort, setActiveSort] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [showAiSummary, setShowAiSummary] = useState<number | null>(null);
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<Post["type"]>("question");
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [shareCopied, setShareCopied] = useState<number | null>(null);

  const filteredPosts = useMemo(() => {
    let result = posts.filter((p) => {
      const matchCat = activeCategory === "all" || p.type === activeCategory;
      const matchSearch = searchQuery === "" ||
        p.title.includes(searchQuery) ||
        p.content.includes(searchQuery) ||
        p.tags.some((t) => t.includes(searchQuery));
      return matchCat && matchSearch;
    });
    if (activeSort === "hot") result.sort((a, b) => b.votes * 2 + b.views - (a.votes * 2 + a.views));
    else if (activeSort === "new") result.sort((a, b) => b.id - a.id);
    else if (activeSort === "top") result.sort((a, b) => b.votes - a.votes);
    return result;
  }, [posts, activeCategory, activeSort, searchQuery]);

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => { const n = new Set(prev); n.has(postId) ? n.delete(postId) : n.add(postId); return n; });
  };

  const handleShare = async (post: Post) => {
    const url = `${window.location.origin}/forum#post-${post.id}`;
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setShareCopied(post.id);
    setTimeout(() => setShareCopied(null), 2000);
  };

  const handleReply = (postId: number) => {
    setExpandedPost(postId);
    setTimeout(() => {
      const el = document.getElementById(`comment-input-${postId}`);
      if (el) el.focus();
    }, 350);
  };

  const handleVote = (postId: number, delta: number) => {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, votes: p.votes + delta } : p));
  };

  const handleCommentLike = (postId: number, commentId: number) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comments: p.comments.map((c) => c.id === commentId ? { ...c, likes: c.likes + 1 } : c) } : p
    ));
  };

  const handleAddComment = async (postId: number) => {
    const text = newComment[postId]?.trim();
    if (!text) return;
    const comment: Comment = {
      id: Date.now(),
      author: locale === "zh" ? "我" : "Me",
      avatar: "我",
      content: text,
      time: locale === "zh" ? "刚刚" : "Just now",
      likes: 0,
    };
    // Optimistic update
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, comment], commentCount: p.commentCount + 1 } : p
    ));
    setNewComment((prev) => ({ ...prev, [postId]: "" }));
    // Persist to API
    try {
      await fetch(`/api/forum/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", content: text, author: locale === "zh" ? "我" : "Me" }),
      });
    } catch { /* fallback: local-only comment */ }
  };

  const handleNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const post: Post = {
      id: Date.now(),
      type: newPostType,
      title: newPostTitle,
      content: newPostContent,
      author: locale === "zh" ? "我" : "Me",
      authorRole: locale === "zh" ? "社区新人" : "New Member",
      avatar: "我",
      time: locale === "zh" ? "刚刚" : "Just now",
      votes: 0,
      views: 0,
      commentCount: 0,
      tags: [],
      comments: [],
    };
    // Optimistic update
    setPosts((prev) => [post, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPost(false);
    // Persist to API
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newPostType, title: post.title, content: post.content, author: post.author, authorRole: post.authorRole }),
      });
      const json = await res.json();
      if (json.data?.id) {
        setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, id: json.data.id } : p));
      }
    } catch { /* fallback: local-only post */ }
  };

  const typeLabel = (type: Post["type"]) => {
    const map = { question: "问答", discussion: "讨论", guide: "攻略", review: "测评" };
    const mapEn = { question: "Q&A", discussion: "Discussion", guide: "Guide", review: "Review" };
    return locale === "zh" ? map[type] : mapEn[type];
  };

  const typeColor = (type: Post["type"]) => {
    const map = { question: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300", discussion: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", guide: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", review: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" };
    return map[type];
  };

  return (
    <main className="flex flex-col min-h-dvh bg-background">

      <div className="bg-linear-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}</Link>
          </Button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {locale === "zh" ? "清远旅行社区" : "Qingyuan Travel Community"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {locale === "zh" ? "问答 · 攻略 · 测评 · 讨论 — 真实旅行者的交流平台" : "Q&A · Guides · Reviews · Discussion — Real traveler community"}
              </p>
            </div>
            <Button onClick={() => setShowNewPost(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-1" />
              {locale === "zh" ? "发帖" : "Post"}
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={locale === "zh" ? "搜索帖子、标签..." : "Search posts, tags..."}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card/80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-emerald-600 text-white"
                      : "bg-card border border-border text-muted-foreground hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {locale === "zh" ? cat.label : cat.labelEn}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-3">
              {sortOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSort(s.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    activeSort === s.id ? "bg-card border border-emerald-300 dark:border-emerald-700 text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <s.icon className="h-3 w-3" />
                  {locale === "zh" ? s.label : s.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="flex-1 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
                >
                  <div className="flex">
                    <div className="flex flex-col items-center gap-0.5 p-3 sm:p-4 border-r border-border bg-card/40 min-w-[52px]">
                      <button onClick={() => handleVote(post.id, 1)} aria-label="Upvote" className="p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-muted-foreground hover:text-emerald-600 transition-colors">
                        <ChevronUp className="h-5 w-5" />
                      </button>
                      <span className={`text-sm font-bold ${post.votes > 100 ? "text-emerald-600" : ""}`}>{post.votes}</span>
                      <button onClick={() => handleVote(post.id, -1)} aria-label="Downvote" className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors">
                        <ChevronDown className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-4 sm:p-5 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeColor(post.type)}`}>
                            {typeLabel(post.type)}
                          </span>
                          {post.accepted && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                              {locale === "zh" ? "已采纳" : "Accepted"}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3
                        className="text-base sm:text-lg font-bold mb-2 cursor-pointer hover:text-emerald-600 transition-colors leading-snug"
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      >
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{post.avatar}</span>
                          <span className="font-medium text-foreground">{post.author}</span>
                          <span>· {post.authorRole}</span>
                        </div>
                        <span>· {post.time}</span>
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{post.views}</span>
                      </div>

                      <AnimatePresence>
                        {expandedPost === post.id ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4 border-l-2 border-emerald-300 dark:border-emerald-700 pl-3">
                              {post.content}
                            </div>

                            {post.aiSummary && (
                              <div className="mb-4">
                                <button
                                  onClick={() => setShowAiSummary(showAiSummary === post.id ? null : post.id)}
                                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 mb-2"
                                >
                                  <Sparkles className="h-3.5 w-3.5" />
                                  {locale === "zh" ? "AI 解读" : "AI Summary"}
                                </button>
                                {showAiSummary === post.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="text-xs bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-muted-foreground leading-relaxed">
                                      <span className="font-medium text-emerald-700 dark:text-emerald-300">AI 解读：</span>{post.aiSummary}
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}

                            <div className="space-y-3 mb-4">
                              <h4 className="text-sm font-semibold flex items-center gap-1">
                                <MessageCircle className="h-4 w-4" />
                                {post.commentCount} {locale === "zh" ? "条回答" : "Answers"}
                              </h4>
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-card border border-border">
                                  <span className="text-xl shrink-0">{comment.avatar}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-semibold">{comment.author}</span>
                                      <span className="text-[10px] text-muted-foreground">{comment.time}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <button
                                        onClick={() => handleCommentLike(post.id, comment.id)}
                                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600 transition-colors"
                                      >
                                        <ThumbsUp className="h-3 w-3" />
                                        {comment.likes}
                                      </button>
                                      <button
                                        onClick={() => handleReply(post.id)}
                                        className="text-xs text-muted-foreground hover:text-foreground"
                                      >
                                        {locale === "zh" ? "回复" : "Reply"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newComment[post.id] || ""}
                                onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                                id={`comment-input-${post.id}`}
                              placeholder={locale === "zh" ? "写下你的回答..." : "Write your answer..."}
                                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                              />
                              <Button onClick={() => handleAddComment(post.id)} size="sm" aria-label="Send" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 border-t border-border pt-3 -mb-1">
                        <button
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {post.commentCount} {locale === "zh" ? "条评论" : "comments"}
                        </button>
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${likedPosts.has(post.id) ? "text-rose-500" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                        >
                          <Heart className={`h-3.5 w-3.5 ${likedPosts.has(post.id) ? "fill-rose-500" : ""}`} />
                          {locale === "zh" ? "喜欢" : "Like"}
                        </button>
                        <button
                          onClick={() => setBookmarked((prev) => { const n = new Set(prev); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${bookmarked.has(post.id) ? "text-amber-500" : "text-muted-foreground hover:bg-card hover:text-foreground"}`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${bookmarked.has(post.id) ? "fill-amber-500" : ""}`} />
                          {locale === "zh" ? "收藏" : "Save"}
                        </button>
                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          {shareCopied === post.id ? (locale === "zh" ? "已复制" : "Copied!") : (locale === "zh" ? "分享" : "Share")}
                        </button>
                        {post.aiSummary && (
                          <button
                            onClick={() => {
                              setExpandedPost(post.id);
                              setShowAiSummary(showAiSummary === post.id ? null : post.id);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            AI{locale === "zh" ? "解读" : " Summary"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{locale === "zh" ? "没有找到相关帖子" : "No posts found"}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowNewPost(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">{locale === "zh" ? "发布新帖" : "New Post"}</h3>
                <button onClick={() => setShowNewPost(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
              </div>

              <div className="flex gap-2 mb-4">
                {(["question", "guide", "review", "discussion"] as Post["type"][]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewPostType(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      newPostType === type ? typeColor(type) + " ring-1 ring-current" : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {typeLabel(type)}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder={locale === "zh" ? "标题（一句话描述你的问题或话题）" : "Title"}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder={locale === "zh" ? "详细描述...（支持换行）" : "Details..."}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>
                  {locale === "zh" ? "取消" : "Cancel"}
                </Button>
                <Button onClick={handleNewPost} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!newPostTitle.trim()}>
                  {locale === "zh" ? "发布" : "Publish"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
