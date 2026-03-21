"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Settings, Info, X, ChevronRight, Sun, Moon, Monitor, Languages, LogOut, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";

export default function TrayWidget() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (hidden) return null;

  return (
    <>
      <div ref={ref} className="fixed bottom-20 left-4 z-40">
        {/* Tray icon */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setOpen(!open)}
          aria-label="智游清远快捷菜单"
          className="h-10 w-10 rounded-xl bg-white dark:bg-zinc-800 border border-border shadow-lg shadow-black/10 flex items-center justify-center transition-all hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-700"
        >
          <div className="h-6 w-6 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Mountain className="h-3.5 w-3.5 text-white" />
          </div>
        </motion.button>

        {/* Context menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 6 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-12 left-0 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-border shadow-2xl shadow-black/15 overflow-hidden py-1.5"
            >
              {/* Settings */}
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                onClick={() => { setOpen(false); setShowSettings(true); }}
              >
                <Settings className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-foreground">{locale === "zh" ? "设置" : "Settings"}</div>
                  <div className="text-[11px] text-muted-foreground">{locale === "zh" ? "主题/语言" : "Theme / Language"}</div>
                </div>
                <ChevronRight className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* About */}
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                onClick={() => { setOpen(false); setShowAbout(true); }}
              >
                <Info className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <div className="text-[13px] font-medium text-foreground">{locale === "zh" ? "关于智游清远" : "About"}</div>
                <ChevronRight className="h-3 w-3 text-zinc-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <div className="my-1 border-t border-border/60" />

              {/* Exit / hide */}
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                onClick={() => { setOpen(false); setHidden(true); }}
              >
                <LogOut className="h-3.5 w-3.5 text-red-500 shrink-0" />
                <div className="text-[13px] font-medium text-red-600">{locale === "zh" ? "退出" : "Exit"}</div>
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                onClick={() => setOpen(false)}
              >
                <PanelLeftClose className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                <div className="text-[13px] text-muted-foreground">{locale === "zh" ? "关闭悬浮窗" : "Close Widget"}</div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-[300px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold text-foreground">{locale === "zh" ? "设置" : "Settings"}</h2>
                </div>
                <button onClick={() => setShowSettings(false)} aria-label="关闭" className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Theme */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    {locale === "zh" ? "主题" : "Theme"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light", icon: <Sun className="h-4 w-4" />, label: locale === "zh" ? "浅色" : "Light" },
                      { value: "dark", icon: <Moon className="h-4 w-4" />, label: locale === "zh" ? "深色" : "Dark" },
                      { value: "system", icon: <Monitor className="h-4 w-4" />, label: locale === "zh" ? "跟随系统" : "System" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTheme(opt.value)}
                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                          theme === opt.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "border-border text-muted-foreground hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/40"
                        }`}
                      >
                        {opt.icon}
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    {locale === "zh" ? "语言" : "Language"}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "zh" as const, label: "中文", sublabel: "简体中文" },
                      { value: "en" as const, label: "English", sublabel: "English" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLocale(opt.value)}
                        className={`flex items-center gap-2.5 py-2.5 px-3 rounded-xl border text-left transition-all ${
                          locale === opt.value
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : "border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-muted/40"
                        }`}
                      >
                        <Languages className={`h-4 w-4 shrink-0 ${locale === opt.value ? "text-emerald-600" : "text-muted-foreground"}`} />
                        <div>
                          <div className={`text-xs font-semibold ${locale === opt.value ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>{opt.label}</div>
                          <div className="text-[10px] text-muted-foreground">{opt.sublabel}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About dialog */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
            onClick={() => setShowAbout(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-[300px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAbout(false)}
                aria-label="关闭"
                className="absolute top-3 right-3 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Top gradient */}
              <div className="bg-linear-to-br from-emerald-500/10 to-teal-500/5 px-6 pt-7 pb-5 text-center border-b border-border">
                <div className="flex justify-center mb-3">
                  <div className="h-14 w-14 rounded-[14px] bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Mountain className="h-7 w-7 text-white" />
                  </div>
                </div>
                <h2 className="text-base font-bold text-foreground">智游清远</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">SmartTravel Qingyuan · v1.0.0</p>
              </div>

              {/* Info rows */}
              <div className="px-5 py-4 space-y-2.5 text-xs">
                {[
                  { label: "版本", value: "1.0.0.20260315" },
                  { label: "AI引擎", value: "Qwen · LangChain RAG" },
                  { label: "检索算法", value: "BM25 + TF-IDF + Embedding" },
                  { label: "知识库", value: "清远乡村旅游 · 20+ 文档" },
                  { label: "覆盖村落", value: "峰林小镇 · 千年瑶寨 · 上岳 · 油岭 · 积庆里" },
                ].map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-3">
                    <span className="text-muted-foreground shrink-0">{row.label}</span>
                    <span className="text-foreground text-right font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div className="px-5 pb-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground border-t border-border pt-3">
                <Link href="/terms" onClick={() => setShowAbout(false)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  服务协议
                </Link>
                <span className="text-border">·</span>
                <Link href="/privacy" onClick={() => setShowAbout(false)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  隐私政策
                </Link>
                <span className="text-border">·</span>
                <Link href="/community-guidelines" onClick={() => setShowAbout(false)} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  社区准则
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
