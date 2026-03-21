"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Locale = "zh" | "en";

type Translations = {
  [key: string]: {
    zh: string;
    en: string;
  };
};

const translations: Translations = {
  // Navbar
  "nav.features": { zh: "核心功能", en: "Features" },
  "nav.tech": { zh: "技术架构", en: "Architecture" },
  "nav.explore": { zh: "探索更多", en: "Explore" },
  "nav.testimonials": { zh: "用户评价", en: "Reviews" },
  "nav.faq": { zh: "常见问题", en: "FAQ" },
  "nav.cta": { zh: "立即体验", en: "Get Started" },
  "nav.villages": { zh: "村落展示", en: "Villages" },

  // Dropdown
  "dropdown.villages": { zh: "村落发现引擎", en: "Village Discovery" },
  "dropdown.villages.desc": { zh: "算法推荐小众秘境，发现真正原生态的乡野", en: "Algorithm-powered hidden gem recommendations" },
  "dropdown.planner": { zh: "AI智能规划", en: "AI Trip Planner" },
  "dropdown.planner.desc": { zh: "30秒生成个性化乡村行程，LangChain多工具协同", en: "30-second personalized itinerary with LangChain" },
  "dropdown.map": { zh: "实景地图导航", en: "Live Map Navigation" },
  "dropdown.map.desc": { zh: "16层高德地图叠加，实时天气与安全指数", en: "16-layer Amap with real-time weather & safety" },
  "dropdown.guide": { zh: "数字人伴游", en: "AI Tour Guide" },
  "dropdown.guide.desc": { zh: "会方言的AI导游，粤语/瑶语理解，全程语音讲解", en: "Dialect-aware AI guide with voice narration" },
  "dropdown.community": { zh: "社区共建共享", en: "Community Co-build" },
  "dropdown.community.desc": { zh: "CBT社区受益追踪，确保旅游收入惠及村民", en: "CBT tracking ensures tourism benefits villagers" },

  // Hero
  "hero.badge": { zh: "HarmonyOS ArkTS · LangChain · 端侧AI", en: "HarmonyOS ArkTS · LangChain · On-device AI" },
  "hero.title1": { zh: "告别盲从，发现你的", en: "Discover Your" },
  "hero.title2": { zh: "专属小众秘境", en: "Hidden Paradise" },
  "hero.desc": { zh: "基于LangChain端侧AI引擎，融合村落口碑分算法、实景地图导航和数字人伴游，为您打造30秒生成的个性化乡村旅行方案。", en: "Powered by on-device LangChain AI, combining village reputation algorithms, live map navigation, and AI tour guide for 30-second personalized rural travel plans." },
  "hero.cta1": { zh: "立即体验", en: "Get Started" },
  "hero.cta2": { zh: "了解技术架构", en: "View Architecture" },

  // Features
  "features.label": { zh: "Core Features", en: "Core Features" },
  "features.title": { zh: "四大核心功能模块", en: "Four Core Modules" },
  "features.desc": { zh: "您的24小时乡村旅行管家 — 从发现、规划、导航到陪伴的一站式智能化服务", en: "Your 24/7 rural travel concierge — one-stop intelligent service from discovery to companionship" },

  // Stats
  "stats.visitors": { zh: "2024年乡村游客人次", en: "2024 Rural Tourists" },
  "stats.satisfaction": { zh: "用户满意度", en: "User Satisfaction" },
  "stats.speed": { zh: "AI行程生成", en: "AI Plan Generation" },
  "stats.innovation": { zh: "独创技术创新", en: "Tech Innovations" },

  // Villages
  "villages.label": { zh: "Featured Villages", en: "Featured Villages" },
  "villages.title": { zh: "清远5大特色村落", en: "5 Featured Qingyuan Villages" },
  "villages.desc": { zh: "算法穿透流量迷雾，发掘服务质量高、口碑好的原生态村落", en: "Algorithm-powered discovery of authentic villages with great reputation" },

  // Tech
  "tech.label": { zh: "Technology Architecture", en: "Technology Architecture" },
  "tech.title": { zh: "AI技术架构", en: "AI Architecture" },
  "tech.desc": { zh: "HarmonyOS ArkTS原生实现完整LangChain架构，12项代码独创创新超越PPT设计", en: "Native HarmonyOS ArkTS LangChain implementation with 12 original innovations" },

  // Testimonials
  "testimonials.title": { zh: "用户真实评价", en: "User Reviews" },
  "testimonials.desc": { zh: "来自游客、村民、研究者的真实反馈", en: "Real feedback from tourists, villagers, and researchers" },
  "testimonials.more": { zh: "查看更多", en: "View More" },

  // FAQ
  "faq.title": { zh: "常见问题", en: "FAQ" },
  "faq.desc": { zh: "关于智游清远的常见疑问解答", en: "Frequently asked questions about SmartTravel Qingyuan" },

  // Footer
  "footer.desc": { zh: "AI驱动的乡村旅游数字化解决方案，融合LangChain智能引擎、村落发现算法、实景地图导航和数字人伴游。", en: "AI-powered rural tourism digital solution integrating LangChain, village discovery algorithms, live map navigation, and AI tour guide." },
  "footer.links": { zh: "快速链接", en: "Quick Links" },
  "footer.social": { zh: "关注我们", en: "Follow Us" },
  "footer.copyright": { zh: "智游清远. 版权所有.", en: "SmartTravel Qingyuan. All rights reserved." },

  // Subpages
  "page.back": { zh: "返回首页", en: "Back to Home" },
  "page.villages.title": { zh: "探索清远村落", en: "Explore Qingyuan Villages" },
  "page.villages.desc": { zh: "基于口碑分算法的智能村落推荐，发现属于你的小众秘境", en: "Smart village recommendations powered by reputation algorithms" },
  "page.planner.title": { zh: "AI智能行程规划", en: "AI Trip Planner" },
  "page.planner.desc": { zh: "与AI助手「小智」对话，30秒定制你的专属乡村旅行方案", en: "Chat with AI assistant to create your personalized rural trip in 30 seconds" },
  "page.map.title": { zh: "实景地图导航", en: "Live Map Navigation" },
  "page.map.desc": { zh: "16层高德地图叠加，实时天气、安全指数、POI搜索一站式掌握", en: "16-layer Amap with real-time weather, safety index, and POI search" },
  "page.guide.title": { zh: "数字人智能伴游", en: "AI Tour Guide" },
  "page.guide.desc": { zh: "会方言的AI导游「小智」，支持粤语/瑶语，全程语音讲解文化故事", en: "Dialect-aware AI guide supporting Cantonese/Yao with cultural narration" },
  "page.community.title": { zh: "社区共建共享", en: "Community Co-build" },
  "page.community.desc": { zh: "CBT社区受益追踪，让旅游收入真正惠及每一位村民", en: "CBT tracking ensures tourism income benefits every villager" },

  // Common
  "common.learnMore": { zh: "了解更多", en: "Learn More" },
  "common.tryNow": { zh: "立即体验", en: "Try Now" },
  "common.send": { zh: "发送", en: "Send" },
  "common.filter": { zh: "筛选", en: "Filter" },
  "common.all": { zh: "全部", en: "All" },
  "common.search": { zh: "搜索...", en: "Search..." },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("zh");

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] || key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
