"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Landmark, ChevronDown, Check } from "lucide-react";
import { useEdition, Edition } from "@/lib/edition-context";
import { useI18n } from "@/lib/i18n";

const editions: { id: Edition; icon: typeof User; label: string; labelEn: string; desc: string; descEn: string; color: string; bg: string }[] = [
  {
    id: "personal",
    icon: User,
    label: "个人版",
    labelEn: "Personal",
    desc: "面向个人旅客的智能出行服务",
    descEn: "Smart travel for individuals",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    id: "enterprise",
    icon: Building2,
    label: "企业版",
    labelEn: "Enterprise",
    desc: "文旅企业数字化解决方案",
    descEn: "Digital solutions for tourism business",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-900/20",
  },
  {
    id: "government",
    icon: Landmark,
    label: "政府版",
    labelEn: "Government",
    desc: "智慧文旅管理与乡村振兴平台",
    descEn: "Smart tourism governance platform",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
];

const editionRoutes: Record<Edition, string> = {
  personal: "/",
  enterprise: "/enterprise",
  government: "/government",
};

export default function EditionSwitcher() {
  const { edition, setEdition } = useEdition();
  const { locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const current = editions.find((e) => e.id === edition) || editions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${current.bg} ${current.color} border-current/20 hover:border-current/40`}
        aria-label="Switch edition"
      >
        <current.icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{locale === "zh" ? current.label : current.labelEn}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-[260px] rounded-xl bg-card border border-border shadow-xl p-1.5"
            >
              {editions.map((ed) => {
                const isActive = ed.id === edition;
                return (
                  <button
                    key={ed.id}
                    onClick={() => { setEdition(ed.id); setOpen(false); router.push(editionRoutes[ed.id]); }}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all duration-150 ${
                      isActive ? `${ed.bg}` : "hover:bg-muted/60"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${ed.bg} ${ed.color} shrink-0 mt-0.5`}>
                      <ed.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${isActive ? ed.color : ""}`}>
                          {locale === "zh" ? ed.label : ed.labelEn}
                        </span>
                        {isActive && <Check className={`h-3.5 w-3.5 ${ed.color}`} />}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {locale === "zh" ? ed.desc : ed.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}

              <div className="mt-1 pt-1.5 border-t border-border px-3 pb-1.5">
                <p className="text-[10px] text-muted-foreground text-center">
                  {locale === "zh" ? "三版互联互通 · 数据共享" : "Interconnected · Shared Data"}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
