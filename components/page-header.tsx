"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface PageHeaderProps {
  title: string;
  description: string;
  gradient?: string;
}

export default function PageHeader({ title, description, gradient = "from-emerald-600 to-teal-500" }: PageHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-5 pointer-events-none`}></div>
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              {t("page.back")}
            </Link>
          </Button>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
