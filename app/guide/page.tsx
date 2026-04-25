"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Volume2, VolumeX, MessageCircle, Globe, BookOpen, Heart, ChevronRight, Play, Pause, Send, Loader2, Bot, User as UserIcon, MapPin, Mountain, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import MarkdownRenderer from "@/components/markdown-renderer";

const guidePersona = {
  name: "小智",
  nameEn: "XiaoZhi",
  role: "AI数字人导游",
  roleEn: "AI Digital Tour Guide",
  avatar: "智",
  languages: ["普通话", "粤语", "瑶语"],
  languagesEn: ["Mandarin", "Cantonese", "Yao"],
};

const culturalStories = [
  {
    id: "longgu",
    title: "瑶族长鼓舞的传说",
    titleEn: "Legend of Yao Long Drum Dance",
    category: "非遗",
    categoryEn: "Heritage",
    duration: "3:20",
    content: "长鼓舞是瑶族最具代表性的舞蹈，起源于瑶族先民祭祀盘王的仪式。相传远古时代，瑶族始祖盘王在追猎过程中不幸坠崖身亡，族人悲痛万分，砍下泡桐树制成长鼓，击鼓起舞以纪念祖先...\n\n长鼓两头大中间小，舞者转身跳跃时，鼓声回荡山谷，寓意着与祖先的灵魂对话。2008年被列入国家级非物质文化遗产名录。",
    contentEn: "The Long Drum Dance is the most representative dance of the Yao people, originating from rituals honoring King Pan. The drum, narrow in the middle and wide at both ends, produces echoing sounds through mountain valleys, symbolizing communication with ancestral spirits. Listed as National Intangible Cultural Heritage in 2008.",
    image: "🥁",
  },
  {
    id: "shuagetang",
    title: "耍歌堂 · 瑶族狂欢节",
    titleEn: "Song Hall Festival",
    category: "节庆",
    categoryEn: "Festival",
    duration: "4:15",
    content: "耍歌堂是排瑶最隆重的传统节日，始于宋代，至今已有千年历史。每年农历十月十六日，瑶族同胞身着盛装，聚集在歌堂坪上载歌载舞...\n\n男子击鼓、女子摇铃，先民在歌声中传授农耕知识、讲述迁徙故事。这不仅是一场娱乐活动，更是瑶族口述历史的活态传承方式。耍歌堂发源于油岭瑶寨，是国家级非物质文化遗产。",
    contentEn: "The Song Hall Festival is the most solemn traditional holiday of the Pai Yao, dating back to the Song Dynasty. On the 16th day of the 10th lunar month, Yao people gather in ceremonial dress for singing and dancing, passing down agricultural knowledge and migration stories through oral tradition.",
    image: "🎉",
  },
  {
    id: "guoerqiang",
    title: "锅耳墙 · 广府建筑密码",
    titleEn: "Wok-ear Walls · Cantonese Architecture",
    category: "建筑",
    categoryEn: "Architecture",
    duration: "2:45",
    content: "锅耳墙是岭南广府建筑最典型的标志，因其形状像铁锅的耳朵而得名。这种独特的山墙设计不仅具有美观功能，更是古代防火的智慧结晶...\n\n在上岳古村，你可以看到保存最完整的锅耳墙群。墙头的高度和装饰代表了屋主的社会地位——官家的锅耳墙更高更精美，体现了「耳高者贵」的传统观念。",
    contentEn: "Wok-ear walls are the most iconic feature of Lingnan Cantonese architecture, named for their shape resembling wok handles. Beyond aesthetics, they serve as firebreaks. In Shangyue Village, the best-preserved examples show how wall height indicated social status.",
    image: "🏛️",
  },
  {
    id: "yingdehongcha",
    title: "英德红茶 · 百年茶韵",
    titleEn: "Yingde Black Tea · Century Heritage",
    category: "文化",
    categoryEn: "Culture",
    duration: "3:00",
    content: "英德红茶是中国三大红茶之一，产自清远英德市，有着悠久的种茶历史。英德红茶以其「浓、强、鲜、爽」的品质特点闻名，曾获英女王伊丽莎白二世赞赏...\n\n积庆里茶区位于英德核心产区，这里的茶树生长在喀斯特地貌的红壤之上，独特的微气候赋予茶叶丰富的矿物质口感。每年3-5月是最佳采茶季节。",
    contentEn: "Yingde Black Tea is one of China's three great black teas, known for its 'strong, bold, fresh, crisp' character. Once praised by Queen Elizabeth II, it grows in the karst red soil of Jiqingli, gaining unique mineral flavors. March-May is the best picking season.",
    image: "🍵",
  },
];

const dialectExamples = [
  { phrase: "你好", pinyin: "Nei hou", dialect: "粤语", dialectEn: "Cantonese", translation: "Hello" },
  { phrase: "多谢", pinyin: "Do ze", dialect: "粤语", dialectEn: "Cantonese", translation: "Thank you" },
  { phrase: "畀（去）边度？", pinyin: "Bei bin dou?", dialect: "粤语", dialectEn: "Cantonese", translation: "Where to go?" },
  { phrase: "勉（欢迎）", pinyin: "Mien", dialect: "瑶语", dialectEn: "Yao", translation: "Welcome" },
  { phrase: "幼勉幼结", pinyin: "You mien you jie", dialect: "瑶语", dialectEn: "Yao", translation: "Hello friend" },
];

interface ChatMsg { role: "user" | "assistant"; content: string; }

const guideChatPrompts = [
  { zh: "瑶族长鼓舞是什么？", en: "What is the Yao Long Drum Dance?" },
  { zh: "上岳古村锅耳墙有什么寓意？", en: "What do the wok-ear walls mean?" },
  { zh: "英德红茶怎么泡最好喝？", en: "How to brew Yingde Black Tea?" },
  { zh: "耍歌堂节日什么时候举办？", en: "When is the Song Hall Festival?" },
  { zh: "南岗瑶寨和油岭瑶寨距离多远？", en: "How far between Nangang and Youling?" },
  { zh: "从峰林小镇到积庆里海拔变化大吗？", en: "Elevation change from Fenglin to Jiqingli?" },
];

const spatialRelations = [
  { from: "南岗瑶寨", fromEn: "Nangang", to: "油岭瑶寨", toEn: "Youling", dist: "8km", relation: "南北相邻", relationEn: "North-South neighbors", color: "bg-amber-500" },
  { from: "峰林小镇", fromEn: "Fenglin", to: "积庆里", toEn: "Jiqingli", dist: "90km", relation: "同属英德", relationEn: "Both in Yingde", color: "bg-emerald-500" },
  { from: "峰林小镇", fromEn: "Fenglin", to: "油岭瑶寨", toEn: "Youling", dist: "38km", relation: "海拔差640m", relationEn: "640m elev diff", color: "bg-violet-500" },
  { from: "上岳古村", fromEn: "Shangyue", to: "积庆里", toEn: "Jiqingli", dist: "60km", relation: "东南方向", relationEn: "Southeast", color: "bg-sky-500" },
  { from: "上岳古村", fromEn: "Shangyue", to: "峰林小镇", toEn: "Fenglin", dist: "130km", relation: "跨东西两端", relationEn: "East-West span", color: "bg-rose-500" },
];

const villageGeoInfo = [
  { name: "峰林小镇", nameEn: "Fenglin", elev: 120, terrain: "谷地", terrainEn: "Valley", icon: "🏔️" },
  { name: "南岗瑶寨", nameEn: "Nangang", elev: 803, terrain: "山地", terrainEn: "Mountain", icon: "🏛️" },
  { name: "上岳古村", nameEn: "Shangyue", elev: 45, terrain: "平原", terrainEn: "Plain", icon: "🏘️" },
  { name: "油岭瑶寨", nameEn: "Youling", elev: 760, terrain: "山地", terrainEn: "Mountain", icon: "🎭" },
  { name: "积庆里", nameEn: "Jiqingli", elev: 85, terrain: "丘陵", terrainEn: "Hill", icon: "🍵" },
];

export default function GuidePage() {
  const { locale } = useI18n();
  const [selectedStory, setSelectedStory] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeDialect, setActiveDialect] = useState<string | null>(null);
  const [ttsSupported, setTtsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check TTS support
  useEffect(() => {
    setTtsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const playingStoryRef = useRef<string | null>(null);

  const speakText = (text: string, lang: string = "zh-CN") => {
    if (!ttsSupported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = 0.9;
    utter.pitch = 1.0;
    utter.onend = () => { setIsPlaying(false); playingStoryRef.current = null; };
    utter.onerror = () => { setIsPlaying(false); playingStoryRef.current = null; };
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const toggleStoryAudio = (storyId: string, content: string) => {
    if (isPlaying && playingStoryRef.current === storyId) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      playingStoryRef.current = null;
      return;
    }
    // Stop any existing speech first
    window.speechSynthesis?.cancel();
    playingStoryRef.current = storyId;
    setSelectedStory(storyId);
    setIsPlaying(true);
    // Small delay to ensure cancel completes before new speak
    setTimeout(() => speakText(content, locale === "zh" ? "zh-CN" : "en-US"), 50);
  };

  const speakDialect = (phrase: string, dialect: string) => {
    if (!ttsSupported) return;
    if (activeDialect === phrase) {
      window.speechSynthesis.cancel();
      setActiveDialect(null);
      return;
    }
    setActiveDialect(phrase);
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(phrase);
    utter.lang = dialect === "粤语" ? "zh-HK" : "zh-CN";
    utter.rate = 0.7;
    utter.onend = () => setActiveDialect(null);
    utter.onerror = () => setActiveDialect(null);
    window.speechSynthesis.speak(utter);
  };

  // AI chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: locale === "zh"
      ? "你好！我是小智，清远文化导游AI。我熟悉瑶族、广府、客家文化，可以讲解非遗故事、节庆习俗、建筑艺术和美食文化。有什么想了解的吗？"
      : "Hi! I'm XiaoZhi, your Qingyuan culture AI guide. I know Yao, Cantonese & Hakka cultures. What would you like to learn about?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendChatMessage = async (text?: string) => {
    const msg = text || chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput("");
    const newMessages: ChatMsg[] = [...chatMessages, { role: "user", content: msg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    // Add empty assistant message for streaming
    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, locale }),
      });

      if (!res.ok) throw new Error("Stream failed");
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              setChatMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: accumulated };
                return updated;
              });
            }
          } catch {
            // skip malformed
          }
        }
      }

      // If no content was streamed, show fallback
      if (!accumulated) {
        setChatMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: locale === "zh" ? "抱歉，暂时无法回答" : "Sorry, unable to answer now",
          };
          return updated;
        });
      }
    } catch {
      setChatMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "assistant" && !updated[updated.length - 1].content) {
          updated[updated.length - 1] = {
            role: "assistant",
            content: locale === "zh" ? "网络错误，请稍后重试" : "Network error, please try again",
          };
        } else {
          updated.push({ role: "assistant", content: locale === "zh" ? "网络错误，请稍后重试" : "Network error, please try again" });
        }
        return updated;
      });
    }
    setChatLoading(false);
  };

  const story = selectedStory ? culturalStories.find((s) => s.id === selectedStory) : null;

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={locale === "zh" ? "数字人智能伴游" : "AI Digital Tour Guide"}
        description={locale === "zh" ? "会方言的AI导游「小智」，支持粤语/瑶语，全程语音讲解文化故事" : "Dialect-aware AI guide supporting Cantonese/Yao with cultural narration"}
        gradient="from-rose-500 to-pink-500"
      />

      <section className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="shrink-0">
                <div className="h-24 w-24 rounded-2xl bg-linear-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center text-5xl border border-emerald-200 dark:border-emerald-800">
                  {guidePersona.avatar}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {locale === "zh" ? guidePersona.name : guidePersona.nameEn}
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    {locale === "zh" ? guidePersona.role : guidePersona.roleEn}
                  </span>
                </h2>
                <p className="text-muted-foreground mb-4">
                  {locale === "zh"
                    ? "基于LangChain RAG引擎，拥有20+篇清远村落知识库，支持粤语/瑶语方言理解，12月份季节感知活动推荐，文化敏感度保护。"
                    : "Powered by LangChain RAG with 20+ Qingyuan village knowledge base docs, supporting Cantonese/Yao dialect understanding and seasonal activity recommendations."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-sm">
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                      {(locale === "zh" ? guidePersona.languages : guidePersona.languagesEn).join(" / ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 text-sm">
                    <BookOpen className="h-3.5 w-3.5 text-sky-600" />
                    <span className="text-sky-700 dark:text-sky-300">20+ {locale === "zh" ? "知识库文档" : "Knowledge Docs"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-sm">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-rose-700 dark:text-rose-300">{locale === "zh" ? "文化敏感保护" : "Cultural Sensitivity"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <h3 className="text-xl font-bold mb-4">{locale === "zh" ? "文化故事讲解" : "Cultural Stories"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {culturalStories.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedStory(selectedStory === s.id ? null : s.id)}
                  className="cursor-pointer"
                >
                  <div className={`rounded-2xl border bg-card/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg ${
                    selectedStory === s.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-2xl shrink-0">
                        {s.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {locale === "zh" ? s.category : s.categoryEn}
                          </span>
                          <span className="text-xs text-muted-foreground">{s.duration}</span>
                        </div>
                        <h4 className="font-semibold mb-1">{locale === "zh" ? s.title : s.titleEn}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-emerald-600"
                            onClick={(e) => { e.stopPropagation(); toggleStoryAudio(s.id, locale === "zh" ? s.content : s.contentEn); }}
                          >
                            {isPlaying && selectedStory === s.id ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                            {locale === "zh" ? "语音讲解" : "Audio"}
                          </Button>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedStory === s.id ? "rotate-90" : ""}`} />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedStory === s.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-border">
                            {isPlaying && (
                              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <Volume2 className="h-4 w-4 text-emerald-600 animate-pulse" />
                                <div className="flex-1 h-1 bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-emerald-600 rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 10, ease: "linear" }}
                                  />
                                </div>
                                <span className="text-xs text-emerald-600">{s.duration}</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {locale === "zh" ? s.content : s.contentEn}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI 文化问答 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Bot className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base">{locale === "zh" ? "AI文化问答" : "AI Culture Q&A"}</h3>
                <p className="text-xs text-muted-foreground">{locale === "zh" ? "向小智提问，深度了解清远文化" : "Ask XiaoZhi about Qingyuan culture"}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  RAG + BM25
                </span>
                <span className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 dark:bg-violet-900/30 px-2 py-1 rounded-full border border-violet-200 dark:border-violet-800">
                  SSE Streaming
                </span>
              </div>
            </div>

            {/* Quick Prompts */}
            <div className="px-6 pt-4 flex flex-wrap gap-2">
              {guideChatPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendChatMessage(locale === "zh" ? p.zh : p.en)}
                  disabled={chatLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all disabled:opacity-50"
                >
                  {locale === "zh" ? p.zh : p.en}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="px-6 py-4 space-y-4 max-h-80 overflow-y-auto">
              {chatMessages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    m.role === "assistant" ? "bg-emerald-500" : "bg-sky-500"
                  }`}>
                    {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-sky-500 text-white rounded-tr-sm"
                      : "bg-muted/60 rounded-tl-sm"
                  }`}>
                    {m.role === "assistant" ? <MarkdownRenderer content={m.content} /> : m.content}
                  </div>
                </div>
              ))}
              {chatLoading && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === "assistant" && !chatMessages[chatMessages.length - 1].content && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                    <span className="text-xs text-muted-foreground">{locale === "zh" ? "思考中..." : "Thinking..."}</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 pb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                  placeholder={locale === "zh" ? "向小智提问文化知识..." : "Ask about culture..."}
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-50 transition-all"
                />
                <Button
                  onClick={() => sendChatMessage()}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 w-10 p-0 rounded-xl"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">{locale === "zh" ? "方言速查" : "Dialect Phrasebook"}</h3>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
              <div className="grid grid-cols-5 gap-0 text-xs font-semibold text-muted-foreground px-5 py-3 border-b border-border bg-card/80">
                <div>{locale === "zh" ? "短语" : "Phrase"}</div>
                <div>{locale === "zh" ? "发音" : "Pronunciation"}</div>
                <div>{locale === "zh" ? "方言" : "Dialect"}</div>
                <div>{locale === "zh" ? "含义" : "Meaning"}</div>
                <div>{locale === "zh" ? "试听" : "Listen"}</div>
              </div>
              {dialectExamples.map((d, idx) => (
                <motion.div
                  key={d.phrase}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.08 }}
                  className="grid grid-cols-5 gap-0 px-5 py-3 border-b border-border last:border-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                >
                  <div className="text-sm font-medium">{d.phrase}</div>
                  <div className="text-sm text-muted-foreground">{d.pinyin}</div>
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      d.dialect === "粤语" ? "bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300" : "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                    }`}>
                      {locale === "zh" ? d.dialect : d.dialectEn}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{d.translation}</div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => speakDialect(d.phrase, d.dialect)}
                    >
                      {activeDialect === d.phrase ? (
                        <Volume2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                      ) : (
                        <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          {/* GIS空间知识图谱 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              {locale === "zh" ? "村落空间关系图" : "Village Spatial Knowledge Graph"}
            </h3>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6">
              {/* Village elevation overview */}
              <div className="grid grid-cols-5 gap-3 mb-6">
                {villageGeoInfo.map((v) => (
                  <div key={v.name} className="text-center">
                    <div className="text-2xl mb-1">{v.icon}</div>
                    <div className="text-xs font-bold truncate">{locale === "zh" ? v.name : v.nameEn}</div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <Mountain className="h-2.5 w-2.5" />
                      {v.elev}m
                    </div>
                    <div className="text-[10px] text-muted-foreground">{locale === "zh" ? v.terrain : v.terrainEn}</div>
                  </div>
                ))}
              </div>

              {/* Spatial relations */}
              <div className="space-y-2">
                {spatialRelations.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                  >
                    <span className="text-xs font-bold w-20 truncate text-right">{locale === "zh" ? r.from : r.fromEn}</span>
                    <div className="flex-1 flex items-center gap-1.5">
                      <div className="flex-1 h-px bg-border" />
                      <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-medium ${r.color} whitespace-nowrap`}>
                        {r.dist}
                      </div>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <span className="text-xs font-bold w-20 truncate">{locale === "zh" ? r.to : r.toEn}</span>
                    <span className="text-[10px] text-muted-foreground w-24 text-right hidden sm:inline">{locale === "zh" ? r.relation : r.relationEn}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground mt-4 text-center">
                {locale === "zh"
                  ? "✨ 小智已具备空间认知能力，可以描述村落之间的位置关系、距离和海拔变化"
                  : "✨ XiaoZhi has spatial awareness — can describe village locations, distances & elevation changes"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
