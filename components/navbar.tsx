"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeSwitcher from "@/components/theme-switcher";
import LanguageSwitcher from "@/components/language-switcher";
import {
  ChevronDownIcon,
  HamburgerMenuIcon,
  Cross1Icon,
} from "@radix-ui/react-icons";
import { MapPin, Brain, Mountain, Compass, Sparkles, Users, MessageSquare, CreditCard, Trophy, LogIn, UserPlus, User, Box } from "lucide-react";
import EditionSwitcher from "@/components/edition-switcher";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { t, locale } = useI18n();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname === "/desktop") return null;

  const menuItems = [
    { name: t("nav.features"), href: "/#features" },
    { name: t("nav.tech"), href: "/#tech" },
    { name: t("nav.villages"), href: "/villages" },
    { name: locale === "zh" ? "社区" : "Forum", href: "/forum" },
    { name: locale === "zh" ? "排行榜" : "Rankings", href: "/rankings" },
    { name: locale === "zh" ? "定价" : "Pricing", href: "/pricing" },
    { name: locale === "zh" ? "个人主页" : "Profile", href: isAuthenticated ? "/profile" : "/login" },
  ];

  const dropdownItems = [
    { icon: Compass, href: "/villages", title: t("dropdown.villages"), desc: t("dropdown.villages.desc") },
    { icon: Brain, href: "/planner", title: t("dropdown.planner"), desc: t("dropdown.planner.desc") },
    { icon: MapPin, href: "/map", title: t("dropdown.map"), desc: t("dropdown.map.desc") },
    { icon: Sparkles, href: "/guide", title: t("dropdown.guide"), desc: t("dropdown.guide.desc") },
    { icon: Box, href: "/3d", title: locale === "zh" ? "3D扫描建模" : "3D Scanning", desc: locale === "zh" ? "摄影测量/LiDAR高保真数字孪生" : "Photogrammetry/LiDAR digital twins" },
    { icon: Users, href: "/community", title: t("dropdown.community"), desc: t("dropdown.community.desc") },
    { icon: MessageSquare, href: "/forum", title: locale === "zh" ? "旅行社区" : "Community Forum", desc: locale === "zh" ? "问答·攻略·测评，真实旅行者交流平台" : "Q&A, guides, reviews from real travelers" },
    { icon: Trophy, href: "/rankings", title: locale === "zh" ? "村落排行榜" : "Village Rankings", desc: locale === "zh" ? "多维度实时排名，发现最佳目的地" : "Multi-dimensional real-time rankings" },
    { icon: CreditCard, href: "/pricing", title: locale === "zh" ? "订阅方案" : "Pricing Plans", desc: locale === "zh" ? "灵活定价，探索版/智行版/尊享版" : "Flexible plans: Explorer/Pro/Premium" },
    { icon: User, href: isAuthenticated ? "/profile" : "/login", title: locale === "zh" ? "个人主页" : "My Profile", desc: locale === "zh" ? "查看个人主页、统计、收藏与设置" : "View your profile, stats, favorites & settings" },
  ];

  const showNavbarBlur = isScrolled || isMenuOpen;

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-300 ease-out ${
        showNavbarBlur
          ? "backdrop-blur supports-backdrop-filter:bg-background/60"
          : "backdrop-blur-0 supports-backdrop-filter:bg-background/0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isMenuOpen ? <Cross1Icon /> : <HamburgerMenuIcon />}
              </motion.div>
            </Button>
          </div>
          <div className="flex sm:hidden">
            <Link href="/" className="font-semibold tracking-tight text-lg flex items-center gap-1.5">
              <Mountain className="h-5 w-5 text-emerald-600" />
              <span className="bg-linear-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">智游乡野</span>
            </Link>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            <Link href="/" className="font-semibold tracking-tight text-xl flex items-center gap-2">
              <Mountain className="h-6 w-6 text-emerald-600" />
              <span className="bg-linear-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">智游乡野</span>
            </Link>

            <Button asChild variant="ghost" size="sm">
              <Link href="/#features">{t("nav.features")}</Link>
            </Button>

            <Button asChild variant="ghost" size="sm">
              <Link href="/#tech">{t("nav.tech")}</Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {t("nav.explore")}
                  <ChevronDownIcon className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-start gap-2 cursor-pointer">
                      <item.icon className="mr-1 h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild variant="ghost" size="sm">
              <Link href="/#testimonials">{t("nav.testimonials")}</Link>
            </Button>

            <Button asChild variant="ghost" size="sm">
              <Link href={isAuthenticated ? "/profile" : "/login"}>
                <User className="h-4 w-4 mr-1" />
                {locale === "zh" ? "个人主页" : "Profile"}
              </Link>
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
              <Link href="/planner">
                {t("nav.cta")}
              </Link>
            </Button>
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1.5">
                    {user.avatar ? <span className="text-base">{user.avatar}</span> : <User className="h-4 w-4" />}
                    <span className="max-w-[80px] truncate">{user.name}</span>
                    <ChevronDownIcon className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="text-xs text-muted-foreground" disabled>
                    {user.phone || user.email || user.id}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    {locale === "zh" ? "个人主页" : "My Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/planner")}>
                    {locale === "zh" ? "我的行程" : "My Trips"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/pricing")}>
                    {locale === "zh" ? "我的订阅" : "My Subscription"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { await logout(); router.push("/"); }} className="text-red-600">
                    {locale === "zh" ? "退出登录" : "Sign Out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    {locale === "zh" ? "登录" : "Login"}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4 mr-1" />
                    {locale === "zh" ? "注册" : "Sign Up"}
                  </Link>
                </Button>
              </>
            )}
            <EditionSwitcher />
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="sm:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="px-2 pt-2 pb-3 space-y-1"
              >
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-base font-medium text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="border-t border-border pt-2 mt-2"
                >
                  <div className="px-3 py-1 text-xs text-muted-foreground font-medium uppercase">{t("nav.explore")}</div>
                  {dropdownItems.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4 text-emerald-600" />
                      {item.title}
                    </Link>
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 }}
                >
                  <Link
                    href="/planner"
                    className="block px-3 py-2 text-base font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t("nav.cta")}
                  </Link>
                  <div className="flex gap-2 px-3 pt-2">
                    {isAuthenticated && user ? (
                      <>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors">
                        {locale === "zh" ? "个人主页" : "Profile"}
                      </Link>
                      <button
                        onClick={async () => { await logout(); setIsMenuOpen(false); router.push("/"); }}
                        className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                      >
                        {locale === "zh" ? "退出" : "Sign Out"}
                      </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">
                          {locale === "zh" ? "登录" : "Login"}
                        </Link>
                        <Link href="/register" onClick={() => setIsMenuOpen(false)} className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                          {locale === "zh" ? "注册" : "Sign Up"}
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
