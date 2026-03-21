"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Headphones, CheckCircle, MessageCircle, RefreshCw, Shield, Ban,
  BarChart3, Filter, AlertTriangle, Clock, Send, XCircle, ChevronDown,
  TrendingUp, Users, Bot, UserCheck, FileText, Search,
} from "lucide-react";

interface Ticket {
  id: string; ticketNo: string; subject: string; category: string;
  status: string; priority?: string; createdAt: string; userId?: string;
}
interface Message { sender: string; content: string; createdAt: string; }
interface BanRecord {
  id: string; userId: string; type: string; status: string; reason: string;
  expiresAt: string | null; createdAt: string;
  user?: { id: string; name: string; phone?: string; email?: string };
}
interface TicketStats {
  total: number;
  byStatus: { status: string; count: number }[];
  byCategory: { category: string; count: number }[];
  satisfaction: { avg: number; count: number };
  resolution: { aiResolved: number; agentResolved: number; aiRate: number };
  avgResolveMinutes: number;
  dailyTrend: { date: string; count: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string; darkColor: string }> = {
  AI_HANDLING:  { label: "AI处理中",   color: "bg-blue-500/20 text-blue-400",   darkColor: "border-blue-500/30" },
  HUMAN_QUEUE:  { label: "等待人工",   color: "bg-amber-500/20 text-amber-400",  darkColor: "border-amber-500/30" },
  HUMAN_ACTIVE: { label: "人工进行中", color: "bg-emerald-500/20 text-emerald-400", darkColor: "border-emerald-500/30" },
  RESOLVED:     { label: "已解决",     color: "bg-gray-500/20 text-gray-400",    darkColor: "border-gray-500/30" },
  CLOSED:       { label: "已关闭",     color: "bg-gray-600/20 text-gray-500",    darkColor: "border-gray-600/30" },
};

const CATEGORY_LABELS: Record<string, string> = {
  account: "账号", payment: "支付", trip: "行程", village: "村落",
  map: "地图", forum: "社区", technical: "技术", other: "其他", general: "通用",
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  URGENT: { label: "紧急", color: "text-red-400 bg-red-500/20" },
  HIGH:   { label: "高",   color: "text-orange-400 bg-orange-500/20" },
  NORMAL: { label: "普通", color: "text-gray-400 bg-gray-500/20" },
  LOW:    { label: "低",   color: "text-gray-500 bg-gray-600/20" },
};

type TabType = "tickets" | "stats" | "bans";

export default function AgentConsolePage() {
  const [tab, setTab] = useState<TabType>("tickets");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [statsRange, setStatsRange] = useState("7d");

  // Bans
  const [bans, setBans] = useState<BanRecord[]>([]);
  const [banLoading, setBanLoading] = useState(false);
  const [banForm, setBanForm] = useState({ userId: "", type: "POST", reason: "", duration: "" });
  const [showBanForm, setShowBanForm] = useState(false);

  // Load tickets
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/support/ticket?list=true");
      if (r.ok) { const d = await r.json(); setTickets(d.tickets || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/stats?type=overview&range=${statsRange}`);
      if (r.ok) { const d = await r.json(); setStats(d.ticket || d); }
    } catch { /* ignore */ }
  }, [statsRange]);

  // Load bans
  const loadBans = useCallback(async () => {
    setBanLoading(true);
    try {
      const r = await fetch("/api/admin/ban?list=true");
      if (r.ok) { const d = await r.json(); setBans(d.bans || []); }
    } catch { /* ignore */ } finally { setBanLoading(false); }
  }, []);

  const openTicket = async (id: string) => {
    setActiveId(id);
    try {
      const r = await fetch(`/api/support/ticket?id=${id}`);
      if (r.ok) { const d = await r.json(); setMessages(d.ticket?.messages || []); }
    } catch { /* ignore */ }
  };

  const sendReply = async () => {
    if (!reply.trim() || !activeId) return;
    await fetch("/api/support/ticket", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeId, agentMessage: reply, status: "HUMAN_ACTIVE" }),
    });
    setMessages(prev => [...prev, { sender: "AGENT", content: reply, createdAt: new Date().toISOString() }]);
    setReply("");
  };

  const resolve = async (id: string) => {
    await fetch("/api/support/ticket", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "RESOLVED" }),
    });
    load();
  };

  const closeTk = async (id: string) => {
    await fetch("/api/support/ticket", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "CLOSED" }),
    });
    load();
  };

  // Ban actions
  const createBan = async () => {
    if (!banForm.userId || !banForm.reason) return;
    await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: banForm.userId,
        type: banForm.type,
        reason: banForm.reason,
        duration: banForm.duration ? parseInt(banForm.duration) : null,
      }),
    });
    setBanForm({ userId: "", type: "POST", reason: "", duration: "" });
    setShowBanForm(false);
    loadBans();
  };

  const revokeBan = async (id: string) => {
    await fetch("/api/admin/ban", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "revoke", reason: "管理员撤销" }),
    });
    loadBans();
  };

  // Ban user directly from ticket
  const banFromTicket = (userId: string) => {
    setBanForm({ ...banForm, userId });
    setShowBanForm(true);
    setTab("bans");
  };

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, [load]);
  useEffect(() => { if (activeId) { const iv = setInterval(() => openTicket(activeId), 5000); return () => clearInterval(iv); } }, [activeId]);
  useEffect(() => { if (tab === "stats") loadStats(); }, [tab, loadStats]);
  useEffect(() => { if (tab === "bans") loadBans(); }, [tab, loadBans]);

  // Filtered tickets
  const filtered = tickets.filter(t => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (searchQuery && !t.subject.includes(searchQuery) && !t.ticketNo.includes(searchQuery)) return false;
    return true;
  });

  const queueCount = tickets.filter(t => t.status === "HUMAN_QUEUE").length;
  const activeCount = tickets.filter(t => t.status === "HUMAN_ACTIVE").length;
  const aiCount = tickets.filter(t => t.status === "AI_HANDLING").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-gray-200">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1321]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Headphones size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">客服管理控制台</h1>
              <p className="text-xs text-gray-500">智游清远 · 对标淘宝/京东客服体系</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab navigation */}
            {([
              { id: "tickets" as TabType, icon: MessageCircle, label: "工单" },
              { id: "stats" as TabType, icon: BarChart3, label: "统计" },
              { id: "bans" as TabType, icon: Shield, label: "封禁管理" },
            ]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  tab === t.id ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                <t.icon size={14} /> {t.label}
                {t.id === "tickets" && queueCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold">{queueCount}</span>
                )}
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> 刷新
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6">
        {/* ═══ TAB: TICKETS ═══ */}
        {tab === "tickets" && (
          <>
            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "等待人工", value: queueCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
                { label: "处理中", value: activeCount, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                { label: "AI处理", value: aiCount, icon: Bot, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
                { label: "已解决", value: resolvedCount, icon: CheckCircle, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border rounded-xl p-4 flex items-center gap-3`}>
                  <s.icon size={20} className={s.color} />
                  <div>
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="搜索工单号或主题…"
                  className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-emerald-500/50" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none">
                <option value="all">全部状态</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 outline-none">
                <option value="all">全部分类</option>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {/* Ticket list */}
              <div className="col-span-2 bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-300 flex items-center gap-1.5">
                    <FileText size={14} /> 工单列表
                    <span className="text-xs text-gray-500">({filtered.length})</span>
                  </span>
                  <Filter size={13} className="text-gray-500" />
                </div>
                <div className="divide-y divide-white/5 max-h-[560px] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 text-sm">暂无匹配工单</div>
                  ) : filtered.map(t => {
                    const s = STATUS_LABELS[t.status] || { label: t.status, color: "bg-gray-500/20 text-gray-400", darkColor: "" };
                    const p = t.priority ? PRIORITY_LABELS[t.priority] : null;
                    return (
                      <button key={t.id} onClick={() => openTicket(t.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                          activeId === t.id ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "border-l-2 border-transparent"
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-gray-500 font-mono">{t.ticketNo}</span>
                          <div className="flex items-center gap-1.5">
                            {p && <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.color}`}>{p.label}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-200 truncate">{t.subject}</div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-gray-600">{CATEGORY_LABELS[t.category] || t.category}</span>
                          <span className="text-[10px] text-gray-600">{new Date(t.createdAt).toLocaleString("zh-CN")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat panel */}
              <div className="col-span-3 bg-white/[0.03] border border-white/10 rounded-xl flex flex-col" style={{ height: 600 }}>
                {activeId ? (
                  <>
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <span className="font-medium text-sm text-gray-300 flex items-center gap-1.5">
                        <MessageCircle size={14} /> 对话详情
                      </span>
                      <div className="flex items-center gap-2">
                        {tickets.find(t => t.id === activeId)?.userId && (
                          <button onClick={() => banFromTicket(tickets.find(t => t.id === activeId)!.userId!)}
                            className="flex items-center gap-1 text-[11px] bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2.5 py-1 rounded-lg transition-colors">
                            <Ban size={11} /> 封禁用户
                          </button>
                        )}
                        <button onClick={() => closeTk(activeId)}
                          className="flex items-center gap-1 text-[11px] bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 px-2.5 py-1 rounded-lg transition-colors">
                          <XCircle size={11} /> 关闭
                        </button>
                        <button onClick={() => resolve(activeId)}
                          className="flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-colors">
                          <CheckCircle size={11} /> 已解决
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex gap-2 ${m.sender === "USER" ? "justify-end" : ""}`}>
                          {m.sender !== "USER" && (
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              m.sender === "AGENT" ? "bg-purple-500/20" : m.sender === "SYSTEM" ? "bg-amber-500/20" : "bg-emerald-500/20"
                            }`}>
                              {m.sender === "AGENT" ? <Headphones size={12} className="text-purple-400" />
                                : m.sender === "SYSTEM" ? <AlertTriangle size={12} className="text-amber-400" />
                                : <Bot size={12} className="text-emerald-400" />}
                            </div>
                          )}
                          <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                            m.sender === "USER" ? "bg-emerald-600 text-white"
                              : m.sender === "SYSTEM" ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-white/5 text-gray-300"
                          }`}>
                            {m.sender === "SYSTEM" && <span className="text-[10px] text-amber-500 block mb-0.5">[系统]</span>}
                            {m.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-white/10 flex gap-2">
                      <input value={reply} onChange={e => setReply(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendReply()}
                        placeholder="输入回复，Enter发送…"
                        className="flex-1 text-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-600 outline-none focus:border-emerald-500/50" />
                      <button onClick={sendReply} disabled={!reply.trim()}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1.5">
                        <Send size={13} /> 发送
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
                    <MessageCircle size={40} className="text-gray-700" />
                    <p className="text-sm">选择左侧工单查看对话详情</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ TAB: STATS ═══ */}
        {tab === "stats" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 size={20} /> 工单统计报表</h2>
              <select value={statsRange} onChange={e => setStatsRange(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 outline-none">
                <option value="7d">近7天</option>
                <option value="30d">近30天</option>
                <option value="90d">近90天</option>
                <option value="365d">全年</option>
              </select>
            </div>

            {stats ? (
              <div className="space-y-5">
                {/* Overview cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "总工单", value: stats.total, icon: FileText, color: "text-blue-400" },
                    { label: "AI解决率", value: `${stats.resolution.aiRate}%`, icon: Bot, color: "text-emerald-400" },
                    { label: "满意度", value: stats.satisfaction.avg ? `${stats.satisfaction.avg.toFixed(1)}/5` : "N/A", icon: TrendingUp, color: "text-amber-400" },
                    { label: "平均处理(分钟)", value: stats.avgResolveMinutes, icon: Clock, color: "text-purple-400" },
                    { label: "评价数", value: stats.satisfaction.count, icon: Users, color: "text-cyan-400" },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                      <s.icon size={16} className={`${s.color} mb-2`} />
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Status distribution */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">状态分布</h3>
                    <div className="space-y-2">
                      {stats.byStatus.map(s => {
                        const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
                        const sl = STATUS_LABELS[s.status];
                        return (
                          <div key={s.status} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-20">{sl?.label || s.status}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">{s.count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">分类分布</h3>
                    <div className="space-y-2">
                      {stats.byCategory.map(c => {
                        const pct = stats.total > 0 ? Math.round((c.count / stats.total) * 100) : 0;
                        return (
                          <div key={c.category} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-20">{CATEGORY_LABELS[c.category] || c.category}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">{c.count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Resolution breakdown */}
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">解决方式</h3>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-emerald-400" />
                      <span className="text-sm text-gray-300">AI自动解决: <span className="font-bold text-emerald-400">{stats.resolution.aiResolved}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-purple-400" />
                      <span className="text-sm text-gray-300">人工解决: <span className="font-bold text-purple-400">{stats.resolution.agentResolved}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-400" />
                      <span className="text-sm text-gray-300">AI解决率: <span className="font-bold text-amber-400">{stats.resolution.aiRate}%</span></span>
                    </div>
                  </div>
                </div>

                {/* Daily trend */}
                {stats.dailyTrend.length > 0 && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">每日趋势</h3>
                    <div className="flex items-end gap-1 h-32">
                      {stats.dailyTrend.map((d, i) => {
                        const max = Math.max(...stats.dailyTrend.map(x => x.count), 1);
                        const h = (d.count / max) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-500">{d.count}</span>
                            <div className="w-full bg-emerald-500/60 rounded-t" style={{ height: `${h}%` }} />
                            <span className="text-[9px] text-gray-600 rotate-[-45deg] origin-left">{d.date.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-600">
                <BarChart3 size={40} className="mx-auto mb-3 text-gray-700" />
                <p className="text-sm">加载统计数据中…</p>
              </div>
            )}
          </>
        )}

        {/* ═══ TAB: BANS ═══ */}
        {tab === "bans" && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><Shield size={20} /> 用户封禁管理</h2>
              <button onClick={() => setShowBanForm(!showBanForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">
                <Ban size={13} /> 新建封禁
              </button>
            </div>

            {/* Ban form */}
            {showBanForm && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 mb-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-1.5"><Ban size={14} /> 创建封禁记录</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">用户ID</label>
                    <input value={banForm.userId} onChange={e => setBanForm({ ...banForm, userId: e.target.value })}
                      placeholder="输入用户ID"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">封禁类型</label>
                    <select value={banForm.type} onChange={e => setBanForm({ ...banForm, type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none">
                      <option value="ACCOUNT">账号封禁</option>
                      <option value="POST">发帖封禁</option>
                      <option value="CHAT">聊天封禁</option>
                      <option value="WARNING">警告</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">封禁原因</label>
                    <input value={banForm.reason} onChange={e => setBanForm({ ...banForm, reason: e.target.value })}
                      placeholder="描述封禁原因"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">时长（小时，留空=永久）</label>
                    <input value={banForm.duration} onChange={e => setBanForm({ ...banForm, duration: e.target.value })}
                      type="number" placeholder="如: 24, 72, 168"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-red-500/50" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setShowBanForm(false)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors">取消</button>
                  <button onClick={createBan} disabled={!banForm.userId || !banForm.reason}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white text-xs rounded-lg transition-colors">
                    确认封禁
                  </button>
                </div>
              </div>
            )}

            {/* Ban list */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="font-medium text-sm text-gray-300">生效中的封禁 ({bans.length})</span>
                <button onClick={loadBans} className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1">
                  <RefreshCw size={12} className={banLoading ? "animate-spin" : ""} /> 刷新
                </button>
              </div>
              <div className="divide-y divide-white/5">
                {bans.length === 0 ? (
                  <div className="p-8 text-center text-gray-600 text-sm">暂无封禁记录</div>
                ) : bans.map(b => (
                  <div key={b.id} className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02]">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-200">{b.user?.name || b.userId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          b.type === "ACCOUNT" ? "bg-red-500/20 text-red-400"
                            : b.type === "POST" ? "bg-orange-500/20 text-orange-400"
                            : b.type === "CHAT" ? "bg-blue-500/20 text-blue-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {b.type === "ACCOUNT" ? "账号封禁" : b.type === "POST" ? "发帖封禁" : b.type === "CHAT" ? "聊天封禁" : "警告"}
                        </span>
                        {b.status === "APPEALED" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">申诉中</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        原因: {b.reason} · 到期: {b.expiresAt ? new Date(b.expiresAt).toLocaleString("zh-CN") : "永久"}
                      </div>
                    </div>
                    <button onClick={() => revokeBan(b.id)}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 px-3 py-1 border border-emerald-500/30 rounded-lg transition-colors">
                      撤销
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
