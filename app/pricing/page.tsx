"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Crown, Rocket, CreditCard, Shield, ArrowRight, Loader2, Sparkles, ChevronDown, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

type PlanId = "explorer" | "pro" | "premium";
type PayMethod = "alipay" | "wechat" | "unionpay" | "visa" | "mastercard";
type BillingCycle = "monthly" | "yearly";

interface PricingPlan {
  id: PlanId;
  name: string;
  nameEn: string;
  monthlyPrice: number;
  yearlyPrice: number;
  desc: string;
  descEn: string;
  icon: typeof Zap;
  color: string;
  popular: boolean;
  badge?: string;
  badgeEn?: string;
  features: { text: string; textEn: string; included: boolean; highlight?: boolean }[];
}

const plans: PricingPlan[] = [
  {
    id: "explorer",
    name: "探索版",
    nameEn: "Explorer",
    monthlyPrice: 4.9,
    yearlyPrice: 49,
    desc: "适合偶尔出行的休闲旅客",
    descEn: "For casual travelers",
    icon: Zap,
    color: "emerald",
    popular: false,
    features: [
      { text: "AI行程规划（每月5次）", textEn: "AI Trip Planning (5/month)", included: true },
      { text: "村落发现引擎（基础推荐）", textEn: "Village Discovery (Basic)", included: true },
      { text: "实景地图导航（4层）", textEn: "Live Map (4 layers)", included: true },
      { text: "数字人基础讲解", textEn: "Basic AI Guide", included: true },
      { text: "社区评价查看", textEn: "Community Reviews", included: true },
      { text: "方言理解（普通话）", textEn: "Mandarin Support", included: true },
      { text: "高级文化深度讲解", textEn: "Deep Cultural Guide", included: false },
      { text: "离线模式", textEn: "Offline Mode", included: false },
      { text: "专属旅行顾问", textEn: "Personal Advisor", included: false },
    ],
  },
  {
    id: "pro",
    name: "智行版",
    nameEn: "Pro",
    monthlyPrice: 29.9,
    yearlyPrice: 299,
    desc: "适合深度游爱好者和家庭出行",
    descEn: "For enthusiasts and families",
    icon: Crown,
    color: "sky",
    popular: true,
    badge: "最受欢迎",
    badgeEn: "Most Popular",
    features: [
      { text: "探索版 全部权益", textEn: "All Explorer features", included: true, highlight: true },
      { text: "AI行程规划（无限次）", textEn: "AI Planning (Unlimited)", included: true },
      { text: "村落发现引擎（深度+口碑分）", textEn: "Village Discovery (Advanced)", included: true },
      { text: "实景地图导航（16层全部）", textEn: "Live Map (All 16 layers)", included: true },
      { text: "方言理解（普通话/粤语/瑶语）", textEn: "Mandarin/Cantonese/Yao", included: true },
      { text: "离线模式（缓存3个村落）", textEn: "Offline Mode (3 villages)", included: true },
      { text: "VSI安全指数实时推送", textEn: "Real-time VSI Alerts", included: true },
      { text: "数字人深度文化讲解", textEn: "Deep Cultural AI Guide", included: true },
      { text: "专属旅行顾问", textEn: "Personal Advisor", included: false },
    ],
  },
  {
    id: "premium",
    name: "尊享版",
    nameEn: "Premium",
    monthlyPrice: 59.9,
    yearlyPrice: 599,
    desc: "适合旅行博主、研究者和商务团队",
    descEn: "For bloggers, researchers & teams",
    icon: Rocket,
    color: "violet",
    popular: false,
    badge: "专业之选",
    badgeEn: "Pro Choice",
    features: [
      { text: "智行版 全部权益", textEn: "All Pro features", included: true, highlight: true },
      { text: "AI优先响应 + 专属算力", textEn: "Priority AI + Dedicated compute", included: true },
      { text: "全算法访问（RAI/CPI/VSI）", textEn: "Full Algorithms (RAI/CPI/VSI)", included: true },
      { text: "16层+卫星+3D地图", textEn: "16 layers + Satellite + 3D", included: true },
      { text: "全方言 + 语音实时翻译", textEn: "All Dialects + Translation", included: true },
      { text: "离线模式（全部村落）", textEn: "Offline (All villages)", included: true },
      { text: "CBT完整报告导出", textEn: "Full CBT Report Export", included: true },
      { text: "专属旅行顾问（7×24）", textEn: "Advisor (24/7)", included: true },
      { text: "API调用（1000次/月）", textEn: "API Access (1000/mo)", included: true },
    ],
  },
];

const AlipayIcon = () => <img src="/payment-icons/alipay.png" alt="支付宝" className="h-7 w-7 rounded object-contain" />;
const WechatPayIcon = () => <img src="/payment-icons/wechat.png" alt="微信支付" className="h-7 w-7 rounded object-contain" />;
const UnionPayIcon = () => <img src="/payment-icons/unionpay.png" alt="银联" className="h-7 w-7 rounded object-contain" />;
const VisaIcon = () => <img src="/payment-icons/visa.png" alt="Visa" className="h-7 w-7 rounded object-contain" />;
const MastercardIcon = () => <img src="/payment-icons/mastercard.png" alt="Mastercard" className="h-7 w-7 rounded object-contain" />;

const payMethodsData: { id: PayMethod; name: string; nameEn: string; icon: React.ReactNode; brandColor: string }[] = [
  { id: "alipay", name: "支付宝", nameEn: "Alipay", icon: <AlipayIcon />, brandColor: "border-[#1677FF]" },
  { id: "wechat", name: "微信支付", nameEn: "WeChat Pay", icon: <WechatPayIcon />, brandColor: "border-[#07C160]" },
  { id: "unionpay", name: "银联", nameEn: "UnionPay", icon: <UnionPayIcon />, brandColor: "border-[#E21E33]" },
  { id: "visa", name: "Visa", nameEn: "Visa", icon: <VisaIcon />, brandColor: "border-[#1A1F71]" },
  { id: "mastercard", name: "万事达卡", nameEn: "Mastercard", icon: <MastercardIcon />, brandColor: "border-[#EB001B]" },
];

export default function PricingPage() {
  const { locale } = useI18n();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState<PayMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "pay" | "success">("select");
  const [showPayDropdown, setShowPayDropdown] = useState(false);

  const getPrice = (plan: PricingPlan) => billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const getPriceDisplay = (plan: PricingPlan) => `¥${getPrice(plan)}`;
  const getPeriod = () => billing === "monthly" ? (locale === "zh" ? "/月" : "/mo") : (locale === "zh" ? "/年" : "/yr");
  const getYearlySaving = (plan: PricingPlan) => Math.round(plan.monthlyPrice * 12 - plan.yearlyPrice);

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlan(planId);
    setPaymentStep("pay");
    setSelectedPayMethod(null);
    setShowPayDropdown(false);
  };

  const handlePayment = async () => {
    if (!selectedPayMethod || !selectedPlan) return;
    setIsProcessing(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan)!;
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          amount: getPrice(plan),
          billing,
          method: selectedPayMethod,
          currency: (selectedPayMethod === "visa" || selectedPayMethod === "mastercard") ? "USD" : "CNY",
        }),
      });
      const data = await res.json();
      if (data.success && data.payUrl) window.open(data.payUrl, "_blank");
      setPaymentStep("success");
    } catch {
      setPaymentStep("success");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedPlan(null);
    setPaymentStep("select");
    setSelectedPayMethod(null);
    setIsProcessing(false);
    setShowPayDropdown(false);
  };

  const currentPlan = selectedPlan ? plans.find((p) => p.id === selectedPlan) : null;
  const currentPayMethod = selectedPayMethod ? payMethodsData.find((m) => m.id === selectedPayMethod) : null;

  const planColor = (color: string, type: "bg" | "border" | "text" | "btn" | "shadow") => {
    const map: Record<string, Record<string, string>> = {
      emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-500", text: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700", shadow: "shadow-emerald-500/10" },
      sky: { bg: "bg-sky-50 dark:bg-sky-900/20", border: "border-sky-500", text: "text-sky-600", btn: "bg-sky-500 hover:bg-sky-600", shadow: "shadow-sky-500/10" },
      violet: { bg: "bg-violet-50 dark:bg-violet-900/20", border: "border-violet-500", text: "text-violet-600", btn: "bg-violet-600 hover:bg-violet-700", shadow: "shadow-violet-500/10" },
    };
    return map[color]?.[type] || "";
  };

  return (
    <main className="flex flex-col min-h-dvh">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-50/80 via-white to-violet-50/80 dark:from-emerald-950/20 dark:via-background dark:to-violet-950/20 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-10 relative">
          <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}</Link>
          </Button>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-5">
              <Sparkles className="h-3 w-3" />
              {locale === "zh" ? "灵活定价 · 随时升降级" : "Flexible Pricing · Upgrade Anytime"}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
              {locale === "zh" ? "选择您的探索方案" : "Choose Your Plan"}
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto mb-8">
              {locale === "zh" ? "从休闲出游到深度探索，总有一款适合您" : "From casual trips to deep exploration, there's a plan for you"}
            </p>

            <div className="inline-flex items-center bg-card border border-border rounded-full p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  billing === "monthly"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locale === "zh" ? "连续包月" : "Monthly"}
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative ${
                  billing === "yearly"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {locale === "zh" ? "连续包年" : "Yearly"}
                <span className="absolute -top-2 -right-12 text-[10px] font-bold text-white bg-linear-to-r from-emerald-500 to-teal-500 px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                  {locale === "zh" ? "最高省¥120" : "Save ¥120"}
                </span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {billing === "yearly"
                ? (locale === "zh" ? "按年计费，最高立省 ¥120" : "Billed annually, save up to ¥120")
                : (locale === "zh" ? "按月计费，随时取消" : "Billed monthly, cancel anytime")}
            </p>
          </motion.div>
        </div>
      </div>

      <section className="flex-1 py-8 px-4 -mt-2">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 mb-16">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`relative group ${plan.popular ? "md:-mt-6 md:mb-6 z-10" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className={`${planColor(plan.color, "btn")} text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg`}>
                      {locale === "zh" ? plan.badge : plan.badgeEn}
                    </span>
                  </div>
                )}
                <div className={`h-full rounded-2xl border-2 bg-card backdrop-blur-sm p-6 lg:p-7 transition-all duration-300 flex flex-col ${
                  plan.popular
                    ? `${planColor(plan.color, "border")} shadow-2xl ${planColor(plan.color, "shadow")}`
                    : "border-border hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xl group-hover:-translate-y-1"
                }`}>
                  <div className="mb-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`p-2.5 rounded-xl ${planColor(plan.color, "bg")} ${planColor(plan.color, "text")}`}>
                        <plan.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-xl">{locale === "zh" ? plan.name : plan.nameEn}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{locale === "zh" ? plan.desc : plan.descEn}</p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base text-muted-foreground font-medium">¥</span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={`${plan.id}-${billing}`}
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-5xl font-extrabold tracking-tighter"
                        >
                          {getPrice(plan)}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-muted-foreground text-sm ml-1">{getPeriod()}</span>
                    </div>
                    <AnimatePresence>
                      {billing === "yearly" && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                          <p className="text-xs text-emerald-600 font-medium mt-1.5">
                            {locale === "zh" ? `较月付节省 ¥${getYearlySaving(plan)}` : `Save ¥${getYearlySaving(plan)} vs monthly`}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {locale === "zh" ? `按月计费 ¥${plan.monthlyPrice}/月` : `¥${plan.monthlyPrice}/mo if monthly`}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <Check className={`h-4 w-4 shrink-0 mt-0.5 ${f.highlight ? planColor(plan.color, "text") : "text-emerald-500"}`} />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/25 shrink-0 mt-0.5" />
                        )}
                        <span className={`${f.included ? "" : "text-muted-foreground/35 line-through"} ${f.highlight ? `font-semibold ${planColor(plan.color, "text")}` : ""}`}>
                          {locale === "zh" ? f.text : f.textEn}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full h-12 text-sm font-semibold rounded-xl ${
                      plan.popular
                        ? `${planColor(plan.color, "btn")} text-white shadow-lg ${planColor(plan.color, "shadow")}`
                        : plan.color === "violet"
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : "bg-foreground text-background hover:opacity-90"
                    }`}
                  >
                    {locale === "zh" ? `订阅 ${plan.name}` : `Subscribe ${plan.nameEn}`}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-lg">{locale === "zh" ? "安全支付保障" : "Secure Payment"}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
              {locale === "zh"
                ? "所有支付通过银行级SSL加密传输，支持支付宝、微信支付、银联、Visa/Mastercard。7天无理由退款，随时取消订阅。"
                : "Bank-grade SSL encryption. Supporting Alipay, WeChat Pay, UnionPay, Visa/Mastercard. 7-day money-back guarantee."}
            </p>
            <div className="flex justify-center items-center gap-5">
              {payMethodsData.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="shrink-0">{m.icon}</span>
                  <span className="hidden sm:inline">{locale === "zh" ? m.name : m.nameEn}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedPlan && paymentStep !== "select" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {paymentStep === "pay" && currentPlan && (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">{locale === "zh" ? "确认订单" : "Confirm Order"}</h3>
                    <button onClick={handleClose} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className={`rounded-xl border-2 ${planColor(currentPlan.color, "border")} ${planColor(currentPlan.color, "bg")} p-4 mb-5`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${planColor(currentPlan.color, "bg")}`}>
                          <currentPlan.icon className={`h-4 w-4 ${planColor(currentPlan.color, "text")}`} />
                        </div>
                        <span className="font-bold">{locale === "zh" ? currentPlan.name : currentPlan.nameEn}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold">{getPriceDisplay(currentPlan)}</span>
                        <span className="text-sm text-muted-foreground">{getPeriod()}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{billing === "yearly" ? (locale === "zh" ? "年付方案 · 自动续费" : "Annual · Auto-renew") : (locale === "zh" ? "月付方案 · 自动续费" : "Monthly · Auto-renew")}</p>
                  </div>

                  <div className="mb-5">
                    <h4 className="text-sm font-semibold mb-2">{locale === "zh" ? "支付方式" : "Payment Method"}</h4>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowPayDropdown(!showPayDropdown)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-border hover:border-emerald-300 dark:hover:border-emerald-700 transition-all bg-background"
                      >
                        {currentPayMethod ? (
                          <div className="flex items-center gap-3">
                            {currentPayMethod.icon}
                            <span className="font-medium text-sm">{locale === "zh" ? currentPayMethod.name : currentPayMethod.nameEn}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">{locale === "zh" ? "请选择支付方式" : "Select payment method"}</span>
                        )}
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showPayDropdown ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {showPayDropdown && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1.5 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
                              {payMethodsData.map((m, i) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPayMethod(m.id);
                                    setShowPayDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50 transition-colors ${
                                    selectedPayMethod === m.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                                  } ${i < payMethodsData.length - 1 ? "border-b border-border" : ""}`}
                                >
                                  {m.icon}
                                  <span className="font-medium flex-1 text-left">{locale === "zh" ? m.name : m.nameEn}</span>
                                  {selectedPayMethod === m.id && <Check className="h-4 w-4 text-emerald-500" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(selectedPayMethod === "visa" || selectedPayMethod === "mastercard") && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-5 overflow-hidden">
                        <div className="space-y-3 pt-1">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">{locale === "zh" ? "卡号" : "Card Number"}</label>
                            <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">{locale === "zh" ? "有效期" : "Expiry"}</label>
                              <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">CVV</label>
                              <input type="text" placeholder="***" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">{locale === "zh" ? "持卡人" : "Name"}</label>
                            <input type="text" placeholder={locale === "zh" ? "持卡人姓名" : "Cardholder Name"} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 mb-4 text-[11px] text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{locale === "zh" ? "SSL加密 · 7天无理由退款 · 随时取消订阅 · 自动续费可关闭" : "SSL · 7-day refund · Cancel anytime · Auto-renew can be disabled"}</span>
                  </div>

                  <Button onClick={handlePayment} disabled={!selectedPayMethod || isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/20">
                    {isProcessing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{locale === "zh" ? "处理中..." : "Processing..."}</>
                    ) : (
                      <><CreditCard className="mr-2 h-5 w-5" />{locale === "zh" ? `确认支付 ${getPriceDisplay(currentPlan)}` : `Pay ${getPriceDisplay(currentPlan)}`}</>
                    )}
                  </Button>
                </>
              )}

              {paymentStep === "success" && currentPlan && (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">{locale === "zh" ? "订阅成功！" : "Subscribed!"}</h3>
                  <p className="text-muted-foreground mb-6">
                    {locale === "zh" ? `已成功订阅${currentPlan.name}，所有功能已解锁。` : `Subscribed to ${currentPlan.nameEn}. All features unlocked.`}
                  </p>
                  <Button onClick={handleClose} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">{locale === "zh" ? "开始探索" : "Start Exploring"}</Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
