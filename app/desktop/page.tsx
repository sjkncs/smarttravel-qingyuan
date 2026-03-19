"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Trash2, MessageSquare, Settings, Send, Loader2,
  Minus, X, Maximize2, Minimize2, Bot, Mountain,
  Sparkles, Globe, Image as ImageIcon, FileText, Mic, ChevronDown,
  Sun, Moon, History, RefreshCw,
  Map, Brain, Compass, Route, PictureInPicture2, VolumeX,
  Check, Paperclip,
  PanelLeftClose, PanelLeft, User, LogIn, ArrowLeft,
} from "lucide-react";
import MarkdownRenderer from "@/components/markdown-renderer";
import dynamic from "next/dynamic";
const CustomerServiceWidget = dynamic(() => import("@/components/support/CustomerServiceWidget"), { ssr: false });
import { useSearchParams } from "next/navigation";

// ── Types ──────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const MODELS = [
  { id: "auto", label: "小智 · 智能" },
  { id: "fast", label: "小智 · 快速" },
  { id: "pro", label: "小智 Pro" },
];

const QUICK_PROMPTS = [
  { label: "行程规划", icon: "🗺️", text: "帮我规划3天2夜清远深度游行程" },
  { label: "村落推荐", icon: "🏘️", text: "推荐适合亲子游的清远村落" },
  { label: "文化导览", icon: "🏛️", text: "介绍一下瑶族耍歌堂文化" },
  { label: "美食攻略", icon: "🍜", text: "清远有哪些必吃的特色美食？" },
  { label: "摄影打卡", icon: "📷", text: "清远最佳拍照地点推荐" },
  { label: "交通指南", icon: "🚌", text: "广州出发去清远怎么最方便？" },
];

const QUICK_ACTIONS = [
  { icon: Brain, label: "AI规划", href: "/planner", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/30" },
  { icon: Compass, label: "村落发现", href: "/villages", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { icon: Map, label: "实景地图", href: "/map", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { icon: Route, label: "AI导游", href: "/guide", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/30" },
  { icon: Globe, label: "网页版", href: "/", color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/30" },
];

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function newConversation(): Conversation {
  return {
    id: generateId(),
    title: "新对话",
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ── Window Controls ────────────────────────────────────
function TitleBar({
  dark, onToggleDark, isElectron = false, webSearch, onToggleWebSearch, onOpenSettings, isMini = false,
}: {
  dark: boolean; onToggleDark: () => void; isElectron?: boolean;
  webSearch: boolean; onToggleWebSearch: () => void; onOpenSettings: () => void; isMini?: boolean;
}) {
  const [isMax, setIsMax] = useState(false);

  const minimize = () => (window as any).electronAPI?.minimize();
  const maximize = () => {
    (window as any).electronAPI?.maximize();
    setIsMax(!isMax);
  };
  const close = () => {
    if (isMini) (window as any).electronAPI?.closeMini();
    else (window as any).electronAPI?.close();
  };
  const openMain = () => (window as any).electronAPI?.openMainWindow();

  return (
    <div
      className="flex items-center justify-between h-10 px-4 select-none shrink-0 border-b border-border/50"
      style={isElectron ? { WebkitAppRegion: "drag" } as React.CSSProperties : undefined}
    >
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <Mountain className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-foreground">{isMini ? "小智" : "智游清远"}</span>
        {!isMini && <span className="text-[10px] text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded">v1.0</span>}
      </div>

      <div
        className="flex items-center gap-1"
        style={isElectron ? { WebkitAppRegion: "no-drag" } as React.CSSProperties : undefined}
      >
        {/* AI联网 toggle */}
        <button
          onClick={onToggleWebSearch}
          aria-label={webSearch ? "关闭联网搜索" : "开启联网搜索"}
          title={webSearch ? "联网搜索已开启" : "联网搜索已关闭"}
          className={`h-7 px-2 rounded-md flex items-center justify-center gap-1 text-xs font-medium transition-colors ${
            webSearch
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }`}
        >
          <Globe className="h-3 w-3" />
          {!isMini && <span>联网</span>}
          {webSearch && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
        </button>

        <button
          onClick={onToggleDark}
          aria-label={dark ? "切换浅色模式" : "切换深色模式"}
          title={dark ? "切换浅色模式" : "切换深色模式"}
          className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
        >
          {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {!isMini && (
          <button
            onClick={onOpenSettings}
            aria-label="设置"
            title="设置"
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        )}

        {isMini && isElectron && (
          <button
            onClick={openMain}
            aria-label="展开主窗口"
            title="展开主窗口"
            className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        )}

        {isElectron && (
          <>
            {!isMini && (
              <>
                <button
                  onClick={() => (window as any).electronAPI?.openMiniWindow()}
                  aria-label="小窗模式"
                  title="小窗模式"
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <PictureInPicture2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={minimize}
                  aria-label="最小化"
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={maximize}
                  aria-label={isMax ? "还原" : "最大化"}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
                >
                  {isMax ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </button>
              </>
            )}
            <button
              onClick={close}
              aria-label="关闭"
              className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────
function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onSearch,
  collapsed,
  onToggleCollapse,
  user,
  onLogin,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onSearch: (q: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  user: { name: string; avatar?: string } | null;
  onLogin: () => void;
}) {
  const [search, setSearch] = useState("");

  const handleSearch = (v: string) => {
    setSearch(v);
    onSearch(v);
  };

  const groups = [
    { label: "今天", items: conversations.filter((c) => isToday(c.updatedAt)) },
    { label: "更早", items: conversations.filter((c) => !isToday(c.updatedAt)) },
  ];

  // Collapsed sidebar — narrow strip with icons only
  if (collapsed) {
    return (
      <aside className="w-[52px] flex flex-col items-center bg-sidebar border-r border-border shrink-0 py-3 gap-2">
        <button
          onClick={onToggleCollapse}
          aria-label="展开侧边栏"
          title="展开侧边栏"
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onNew}
          aria-label="新对话"
          title="新对话"
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex-1" />
        {user ? (
          <button
            aria-label="我的空间"
            title={user.name}
            className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        ) : (
          <button
            onClick={onLogin}
            aria-label="登录"
            title="登录"
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <LogIn className="h-4 w-4" />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-[220px] flex flex-col bg-sidebar border-r border-border shrink-0">
      {/* Collapse + New Chat */}
      <div className="px-3 py-3 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleCollapse}
            aria-label="收起侧边栏"
            title="收起侧边栏"
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all shrink-0"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
          <button
            onClick={onNew}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium transition-all"
          >
            <Plus className="h-4 w-4" />
            新对话
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索对话..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-4">
        {groups.map((g) =>
          g.items.length > 0 ? (
            <div key={g.label}>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 py-1.5">
                {g.label}
              </p>
              <div className="space-y-0.5">
                {g.items.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                      c.id === activeId
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "hover:bg-muted/60 text-foreground/80"
                    }`}
                    onClick={() => onSelect(c.id)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    <span className="truncate flex-1 text-xs">{c.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                      title="删除对话"
                      aria-label="删除对话"
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/20 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        )}
        {conversations.length === 0 && (
          <div className="text-center text-xs text-muted-foreground/50 pt-8">
            <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
            暂无对话记录
          </div>
        )}
      </div>

      {/* User profile + footer */}
      <div className="px-3 py-3 border-t border-border space-y-2">
        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/60 cursor-pointer transition-all">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">我的空间</p>
            </div>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <LogIn className="h-3.5 w-3.5" />
            登录 / 注册
          </button>
        )}
        <button
          onClick={() => window.open("/", "_blank")}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
        >
          <Globe className="h-3.5 w-3.5" />
          打开网页版
        </button>
      </div>
    </aside>
  );
}

function isToday(d: Date) {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

// ── Model Selector ─────────────────────────────────────
function ModelSelector({ model, onChange }: { model: string; onChange: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = MODELS.find((m) => m.id === model) ?? MODELS[0];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted/60 transition-all"
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-xl shadow-xl py-1 z-50"
          >
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => { onChange(m.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                  m.id === model ? "text-emerald-600 font-medium" : "text-foreground"
                }`}
              >
                {m.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────
function SettingsPanel({ open, onClose, webSearch, onToggleWebSearch }: {
  open: boolean; onClose: () => void; webSearch: boolean; onToggleWebSearch: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-[420px] max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">设置</h2>
          <button onClick={onClose} aria-label="关闭设置" title="关闭" className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">联网搜索</p>
              <p className="text-xs text-muted-foreground">允许AI搜索网络获取最新信息</p>
            </div>
            <button
              onClick={onToggleWebSearch}
              aria-label={webSearch ? "联网搜索已开启，点击关闭" : "联网搜索已关闭，点击开启"}
              title={webSearch ? "点击关闭" : "点击开启"}
              className={`relative w-10 h-5 rounded-full transition-colors ${webSearch ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${webSearch ? "left-[22px]" : "left-[2px]"}`} />
            </button>
          </div>
          <div className="border-t border-border" />
          <div>
            <p className="text-sm font-medium mb-2">快捷键</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>发送消息</span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd></div>
              <div className="flex justify-between"><span>换行</span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift+Enter</kbd></div>
              <div className="flex justify-between"><span>新对话</span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl+N</kbd></div>
            </div>
          </div>
          <div className="border-t border-border" />
          <div>
            <p className="text-sm font-medium mb-1">关于</p>
            <p className="text-xs text-muted-foreground">智游清远 v1.0.0 · AI驱动的乡村旅游助手</p>
            <p className="text-xs text-muted-foreground mt-1">SSE流式输出 · BM25+TF-IDF混合检索 · RAG知识库增强</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Desktop Component ─────────────────────────────
export default function DesktopPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background"><div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse"><Mountain className="h-4 w-4 text-white" /></div></div>}>
      <DesktopPageInner />
    </Suspense>
  );
}

function DesktopPageInner() {
  const [dark, setDark] = useState(false);
  const [model, setModel] = useState("auto");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isElectron, setIsElectron] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [listening, setListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const isMini = searchParams.get("mini") === "1";

  // Init
  useEffect(() => {
    const conv = newConversation();
    setConversations([conv]);
    setActiveConvId(conv.id);
    setIsElectron(!!(window as any).electronAPI);

    // Listen for settings event from tray
    (window as any).electronAPI?.onOpenSettings?.(() => setShowSettings(true));

    // Check auth state
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.user) setCurrentUser({ name: data.user.name || data.user.email || "用户" }); })
      .catch(() => {});
  }, []);

  const handleLogin = () => {
    if (isElectron) {
      (window as any).electronAPI?.openExternal("http://localhost:3000/login");
    } else {
      window.open("/login", "_blank");
    }
  };

  // Dark mode
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const newChat = useCallback(() => {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    setInput("");
    setAttachedFile(null);
  }, []);

  const deleteConv = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (id === activeConvId) {
        const remaining = next[0];
        if (remaining) setActiveConvId(remaining.id);
        else {
          const fresh = newConversation();
          setConversations([fresh]);
          setActiveConvId(fresh.id);
          return [fresh];
        }
      }
      return next;
    });
  }, [activeConvId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConvId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") { e.preventDefault(); newChat(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [newChat]);

  const activeConv = conversations.find((c) => c.id === activeConvId);
  const filteredConvs = searchQuery
    ? conversations.filter((c) => c.title.includes(searchQuery) || c.messages.some((m) => m.content.includes(searchQuery)))
    : conversations;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // ── File/Image upload ─────────────────────────────────
  const handleFileUpload = async () => {
    if (isElectron) {
      const path = await (window as any).electronAPI.pickFile();
      if (path) {
        const name = path.split(/[\\/]/).pop();
        setAttachedFile(name);
        setInput((prev) => prev + (prev ? "\n" : "") + `[附件: ${name}]`);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = async () => {
    if (isElectron) {
      const path = await (window as any).electronAPI.pickImage();
      if (path) {
        const name = path.split(/[\\/]/).pop();
        setAttachedFile(name);
        setInput((prev) => prev + (prev ? "\n" : "") + `[图片: ${name}]`);
      }
    } else {
      imageInputRef.current?.click();
    }
  };

  const onBrowserFile = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      setInput((prev) => prev + (prev ? "\n" : "") + `[${type}: ${file.name}]`);
    }
    e.target.value = "";
  };

  // ── Voice input ───────────────────────────────────────
  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setInput((prev) => prev + (prev ? " " : "") + "[语音输入暂不支持当前浏览器]");
      return;
    }
    if (listening) {
      setListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
    setListening(true);
  };

  // ── Navigate to page ──────────────────────────────────
  const navigateTo = (href: string) => {
    if (isElectron) {
      (window as any).electronAPI.openExternal(`http://localhost:3000${href}`);
    } else {
      window.open(href, "_blank");
    }
  };

  // ── Send message (SSE streaming) ──────────────────────
  const sendMessage = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput("");
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = { id: generateId(), role: "user", content: msg, timestamp: new Date() };
    const replyId = generateId();

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          messages: [...c.messages, userMsg, { id: replyId, role: "assistant" as const, content: "", timestamp: new Date() }],
          title: isFirst ? msg.slice(0, 30) : c.title,
          updatedAt: new Date(),
        };
      })
    );

    setLoading(true);

    try {
      const conv = conversations.find((c) => c.id === activeConvId);
      const history = [...(conv?.messages ?? []), userMsg].slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, locale: "zh" }),
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
              const acc = accumulated;
              setConversations((prev) =>
                prev.map((c) =>
                  c.id !== activeConvId ? c : {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === replyId ? { ...m, content: acc } : m
                    ),
                  }
                )
              );
            }
          } catch { /* skip malformed */ }
        }
      }

      if (!accumulated) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== activeConvId ? c : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === replyId ? { ...m, content: "抱歉，暂时无法回答您的问题。" } : m
              ),
            }
          )
        );
      }
    } catch {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== activeConvId ? c : {
            ...c,
            messages: c.messages.map((m) =>
              m.id === replyId ? { ...m, content: "网络连接异常，请检查网络或稍后重试。" } : m
            ),
          }
        )
      );
    }

    setLoading(false);
  };

  const messages = activeConv?.messages ?? [];
  const isEmpty = messages.length === 0;

  // ── Hidden file inputs for browser mode ───────────────
  const hiddenInputs = (
    <>
      <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.pdf,.doc,.docx,.md" onChange={(e) => onBrowserFile(e, "附件")} aria-label="上传文件" />
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => onBrowserFile(e, "图片")} aria-label="上传图片" />
    </>
  );

  // ── Render ────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {hiddenInputs}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} webSearch={webSearch} onToggleWebSearch={() => setWebSearch(!webSearch)} />

      {/* Custom Titlebar */}
      <TitleBar
        dark={dark}
        onToggleDark={() => setDark(!dark)}
        isElectron={isElectron}
        webSearch={webSearch}
        onToggleWebSearch={() => setWebSearch(!webSearch)}
        onOpenSettings={() => setShowSettings(true)}
        isMini={isMini}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden in mini mode) */}
        {!isMini && (
          <Sidebar
            conversations={filteredConvs}
            activeId={activeConvId}
            onSelect={setActiveConvId}
            onNew={newChat}
            onDelete={deleteConv}
            onSearch={setSearchQuery}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            user={currentUser}
            onLogin={handleLogin}
          />
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          {!isMini && (
            <div className="flex items-center justify-between px-6 py-2 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {!isEmpty && (
                  <button
                    onClick={newChat}
                    aria-label="返回"
                    title="返回主页"
                    className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <ModelSelector model={model} onChange={setModel} />
              </div>
              <div className="flex items-center gap-2">
                {!isEmpty && (
                  <button
                    onClick={newChat}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    新对话
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Messages or Welcome */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isEmpty ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex flex-col items-center justify-center min-h-full px-6 py-8 ${isMini ? "pb-4" : ""}`}
                >
                  <div className={`${isMini ? "h-12 w-12 rounded-xl mb-4" : "h-16 w-16 rounded-2xl mb-6"} bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20`}>
                    <Mountain className={isMini ? "h-6 w-6 text-white" : "h-8 w-8 text-white"} />
                  </div>
                  <h1 className={`${isMini ? "text-lg" : "text-2xl"} font-semibold mb-2`}>你好，我是小智</h1>
                  <p className="text-muted-foreground text-sm mb-6 text-center max-w-sm">
                    清远旅游AI助手，专注广东乡村旅游服务
                  </p>

                  {/* Quick prompts grid */}
                  {!isMini && (
                    <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-8">
                      {QUICK_PROMPTS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="flex flex-col items-start gap-1.5 p-3.5 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all text-left group"
                        >
                          <span className="text-xl">{p.icon}</span>
                          <span className="text-sm font-medium">{p.label}</span>
                          <span className="text-xs text-muted-foreground line-clamp-2">{p.text}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {isMini && (
                    <div className="grid grid-cols-2 gap-2 w-full max-w-xs mb-4">
                      {QUICK_PROMPTS.slice(0, 4).map((p) => (
                        <button
                          key={p.label}
                          onClick={() => sendMessage(p.text)}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-all text-left text-xs"
                        >
                          <span>{p.icon}</span>
                          <span className="font-medium">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Cards — functional navigation */}
                  <div className={`flex items-center justify-center ${isMini ? "gap-3" : "gap-6"}`}>
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => navigateTo(a.href)}
                        className="flex flex-col items-center gap-1.5 group"
                      >
                        <div className={`${isMini ? "h-10 w-10" : "h-12 w-12"} rounded-xl ${a.bg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          <a.icon className={`${isMini ? "h-4 w-4" : "h-5 w-5"} ${a.color}`} />
                        </div>
                        <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`${isMini ? "px-4 py-4 space-y-4" : "max-w-3xl mx-auto px-6 py-6 space-y-6"}`}
                >
                  {messages.filter((m) => m.role === "user" || m.content).map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {m.role === "assistant" && (
                        <div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-emerald-500 text-white rounded-tr-sm shadow-sm"
                            : "bg-muted/60 rounded-tl-sm"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          <MarkdownRenderer content={m.content} />
                        ) : (
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && !messages[messages.length - 1].content && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-muted/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
                        <span className="text-xs text-muted-foreground ml-1">思考中...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className={`${isMini ? "px-3 py-3" : "px-6 py-4"} border-t border-border shrink-0`}>
            <div className={isMini ? "" : "max-w-3xl mx-auto"}>
              {/* Attached file indicator */}
              {attachedFile && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[200px] truncate">{attachedFile}</span>
                    <button onClick={() => setAttachedFile(null)} aria-label="移除附件" title="移除" className="hover:text-red-500 ml-1"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              )}

              <div className="relative rounded-2xl border border-border bg-muted/30 focus-within:border-emerald-500/60 focus-within:bg-background transition-all shadow-sm">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); autoResize(); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isMini ? "向小智提问..." : "向小智提问... (Enter发送, Shift+Enter换行)"}
                  rows={1}
                  disabled={loading}
                  className="w-full px-4 pt-3.5 pb-12 text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
                />

                {/* Bottom toolbar — all functional */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 pb-3">
                  <div className="flex items-center gap-0.5">
                    {/* Web Search Toggle */}
                    <button
                      onClick={() => setWebSearch(!webSearch)}
                      aria-label="联网搜索"
                      title={webSearch ? "联网搜索已开启" : "点击开启联网搜索"}
                      className={`h-7 px-2 flex items-center justify-center gap-1 rounded-lg text-xs transition-all ${
                        webSearch
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {!isMini && <span>全网搜索</span>}
                      {webSearch && <Check className="h-3 w-3" />}
                    </button>

                    {/* Upload File */}
                    <button
                      onClick={handleFileUpload}
                      aria-label="上传文件"
                      title="上传文件"
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </button>

                    {/* Upload Image */}
                    <button
                      onClick={handleImageUpload}
                      aria-label="上传图片"
                      title="上传图片"
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>

                    {/* Voice Input */}
                    <button
                      onClick={toggleVoice}
                      aria-label={listening ? "停止录音" : "语音输入"}
                      title={listening ? "停止录音" : "语音输入"}
                      className={`h-7 w-7 flex items-center justify-center rounded-lg transition-all ${
                        listening
                          ? "bg-red-500/15 text-red-500 animate-pulse"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {listening ? <VolumeX className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>

                    {!isMini && (
                      <>
                        <div className="h-4 w-px bg-border mx-1" />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 text-emerald-500" />
                          SSE流式 · RAG增强
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="h-8 w-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-sm shadow-emerald-500/30"
                  >
                    {loading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {!isMini && (
                <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
                  小智由清远旅游知识库驱动 · SSE流式输出 · BM25+TF-IDF混合检索 · 仅供旅游参考
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
      <CustomerServiceWidget />
    </div>
  );
}
