"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
      className="relative h-9 w-9"
      title={locale === "zh" ? "Switch to English" : "切换到中文"}
    >
      <Globe className="h-4 w-4" />
      <span className="absolute -bottom-0.5 -right-0.5 text-[10px] font-bold leading-none bg-emerald-600 text-white rounded-full h-3.5 w-3.5 flex items-center justify-center">
        {locale === "zh" ? "EN" : "中"}
      </span>
    </Button>
  );
}
