"use client";
import { useState, useEffect } from "react";
import { Headphones, User, Clock, CheckCircle, MessageCircle, RefreshCw, LogIn } from "lucide-react";

interface Ticket { id: string; ticketNo: string; subject: string; category: string; status: string; createdAt: string; }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  AI_HANDLING: { label: "AI处理中", color: "bg-blue-100 text-blue-700" },
  HUMAN_QUEUE: { label: "等待人工", color: "bg-amber-100 text-amber-700" },
  HUMAN_ACTIVE: { label: "人工进行中", color: "bg-green-100 text-green-700" },
  RESOLVED: { label: "已解决", color: "bg-gray-100 text-gray-600" },
  CLOSED: { label: "已关闭", color: "bg-gray-100 text-gray-400" },
};

export default function AgentConsolePage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ sender: string; content: string; createdAt: string }[]>([]);
  const [reply, setReply] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/support/ticket?list=true");
      if (r.ok) { const d = await r.json(); setTickets(d.tickets || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

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

  // Auto-refresh ticket list every 10s
  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh active ticket messages every 5s
  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(() => openTicket(activeId), 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">人工客服控制台</h1>
              <p className="text-sm text-gray-500">智游清远 · 客服中心</p>
            </div>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 刷新
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "等待人工", value: tickets.filter(t => t.status === "HUMAN_QUEUE").length, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "处理中", value: tickets.filter(t => t.status === "HUMAN_ACTIVE").length, color: "text-green-600", bg: "bg-green-50" },
            { label: "AI处理", value: tickets.filter(t => t.status === "AI_HANDLING").length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "今日已解决", value: tickets.filter(t => t.status === "RESOLVED").length, color: "text-gray-600", bg: "bg-gray-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Ticket list */}
          <div className="col-span-2 bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b font-medium text-sm text-gray-700">工单列表</div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">暂无工单</div>
              ) : tickets.map(t => {
                const s = STATUS_LABELS[t.status] || { label: t.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <button key={t.id} onClick={() => openTicket(t.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${activeId === t.id ? "bg-green-50 border-l-2 border-green-500" : ""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400 font-mono">{t.ticketNo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                    </div>
                    <div className="text-sm text-gray-800 truncate">{t.subject}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString("zh-CN")}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat panel */}
          <div className="col-span-3 bg-white rounded-xl border flex flex-col" style={{ height: 520 }}>
            {activeId ? (
              <>
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-700">对话详情</span>
                  <button onClick={() => resolve(activeId)}
                    className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                    <CheckCircle size={12} /> 标记已解决
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.sender === "USER" ? "justify-end" : ""}`}>
                      {m.sender !== "USER" && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.sender === "AGENT" ? "bg-purple-100" : "bg-green-100"}`}>
                          {m.sender === "AGENT" ? <Headphones size={13} className="text-purple-600" /> : <MessageCircle size={13} className="text-green-600" />}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${m.sender === "USER" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t flex gap-2">
                  <input value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendReply()}
                    placeholder="输入回复，Enter发送…"
                    className="flex-1 text-sm bg-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-300" />
                  <button onClick={sendReply} disabled={!reply.trim()}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 text-white text-sm rounded-lg transition-colors">
                    发送
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                <MessageCircle size={40} className="text-gray-200" />
                <p className="text-sm">选择左侧工单查看详情</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
