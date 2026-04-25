"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { motion } from "framer-motion";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Mountain, Phone, MapPin, Mail } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const footerLinks = [
    { name: "核心功能", href: "/#features" },
    { name: "技术架构", href: "/#tech" },
    { name: "村落展示", href: "/villages" },
    { name: "旅行社区", href: "/forum" },
    { name: "订阅方案", href: "/pricing" },
    { name: "常见问题", href: "/#faq" },
  ];

  const productLinks = [
    { name: "AI行程规划", href: "/planner" },
    { name: "实景地图导航", href: "/map" },
    { name: "数字人伴游", href: "/guide" },
    { name: "社区共建", href: "/community" },
  ];

  return (
    <footer className="w-full border-t bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4 lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
              >
                <Mountain className="h-5 w-5 text-emerald-600" />
                <span className="bg-linear-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">智游乡野</span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                AI驱动的乡村旅游数字化解决方案，融合LangChain智能引擎、村落发现算法、实景地图导航和数字人伴游。
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">快速链接</h3>
              <div className="flex flex-col gap-2">
                {footerLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">产品功能</h3>
              <div className="flex flex-col gap-2">
                {productLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">联系我们</h3>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>188-5600-8931</span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <a href="mailto:2797660051@qq.com" className="hover:text-foreground transition-colors">2797660051@qq.com</a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>广东省深圳市南山区西丽大学城</span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold mb-2 text-muted-foreground">关注我们</h4>
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                    <Link href="https://github.com/sjkncs" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                      <GitHubLogoIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col items-center justify-between gap-2 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
            <span>© {year} 智游乡野 SmartTravel. 版权所有.</span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <Link href="/terms" className="hover:text-foreground transition-colors">服务协议</Link>
              <span>·</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">隐私政策</Link>
              <span>·</span>
              <Link href="/community-guidelines" className="hover:text-foreground transition-colors">社区准则</Link>
              <span>·</span>
              <Link href="https://github.com/sjkncs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub: sjkncs</Link>
              <span>·</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">#乡村振兴 #AI旅行</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
