"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ArrowUp, Map, Brain, Compass, MessageSquare, Trophy,
  CreditCard, Sparkles, Users, ChevronUp, Menu, X, Headphones, User,
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";

const quickLinks = [
  { icon: Compass, href: "/villages", label: "村落发现", labelEn: "Villages", color: "bg-emerald-500" },
  { icon: Brain, href: "/planner", label: "AI规划", labelEn: "AI Planner", color: "bg-sky-500" },
  { icon: Map, href: "/map", label: "实景地图", labelEn: "Live Map", color: "bg-amber-500" },
  { icon: Sparkles, href: "/guide", label: "数字人伴游", labelEn: "AI Guide", color: "bg-rose-500" },
  { icon: MessageSquare, href: "/forum", label: "旅行社区", labelEn: "Forum", color: "bg-violet-500" },
  { icon: Trophy, href: "/rankings", label: "排行榜", labelEn: "Rankings", color: "bg-orange-500" },
  { icon: Users, href: "/community", label: "社区共建", labelEn: "Community", color: "bg-teal-500" },
  { icon: CreditCard, href: "/pricing", label: "订阅方案", labelEn: "Pricing", color: "bg-indigo-500" },
  { icon: User, href: "/profile", label: "个人主页", labelEn: "Profile", color: "bg-pink-500" },
];

export default function FloatingNav() {
  const { locale } = useI18n();
  const { isAuthenticated, user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isHomePage, setIsHomePage] = useState(true);

  useEffect(() => {
    setIsHomePage(window.location.pathname === "/");

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (typeof window !== "undefined" && window.location.pathname === "/desktop") return null;

  return (
    <>
      {/* Floating Action Panel - Right Side */}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-2">
        {/* Quick Links Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mb-2 p-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl w-[280px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  {locale === "zh" ? "快捷导航" : "Quick Nav"}
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsExpanded(false)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
                  >
                    <div className={`p-2 rounded-xl ${link.color} text-white shadow-sm group-hover:scale-110 transition-transform`}>
                      <link.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground text-center leading-tight">
                      {locale === "zh" ? link.label : link.labelEn}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Back to Home */}
              {!isHomePage && (
                <div className="mt-2 pt-2 border-t border-border">
                  <Link
                    href="/"
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group w-full"
                  >
                    <Home className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {locale === "zh" ? "返回首页" : "Back to Home"}
                    </span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Buttons Stack */}
        <div className="flex flex-col gap-2">
          {/* Scroll to Top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={scrollToTop}
                className="h-11 w-11 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 transition-all duration-200 group"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-4.5 w-4.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Profile button (always visible when logged in and panel is closed) */}
          {isAuthenticated && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Link
                href="/profile"
                className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg flex items-center justify-center hover:shadow-emerald-500/30 hover:scale-105 transition-all duration-200 text-white font-bold text-sm"
                aria-label={locale === "zh" ? "个人主页" : "Profile"}
              >
                {user?.name?.charAt(0) || <User className="h-4.5 w-4.5" />}
              </Link>
            </motion.div>
          )}

          {/* Back to Home (always visible on subpages when panel is closed) */}
          {!isHomePage && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Link
                href="/"
                className="h-11 w-11 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 transition-all duration-200 group"
                aria-label="Back to Home"
              >
                <Home className="h-4.5 w-4.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </Link>
            </motion.div>
          )}

          {/* Main FAB Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-12 w-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
              isExpanded
                ? "bg-foreground text-background"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            aria-label="Toggle navigation"
          >
            <AnimatePresence mode="wait">
              {isExpanded ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
