"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, Lock, ArrowLeft, Loader2, ShieldCheck, Mountain, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ContactType = "phone" | "email";

export default function ForgotPasswordPage() {
  const { locale } = useI18n();
  const router = useRouter();

  const [contactType, setContactType] = useState<ContactType>("phone");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const isContactValid = () => {
    if (contactType === "phone") return /^1[3-9]\d{9}$/.test(contact);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  };

  const handleSendCode = async () => {
    if (countdown > 0) return;
    if (!isContactValid()) {
      setError(contactType === "phone" ? "请输入正确的手机号" : "请输入正确的邮箱");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: contact, type: contactType === "phone" ? "sms" : "email" }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`验证码已发送${data.code ? `（演示: ${data.code}）` : ""}`);
        setCountdown(60);
        countdownRef.current = setInterval(() => {
          setCountdown((c) => {
            if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
            return c - 1;
          });
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("发送失败，请重试");
    }
  };

  const handleVerifyAndNext = () => {
    if (!isContactValid()) { setError("请填写正确的联系方式"); return; }
    if (!code || code.length < 6) { setError("请输入6位验证码"); return; }
    setError("");
    setStep(2);
  };

  const handleResetPassword = async () => {
    setError(""); setSuccess("");
    if (!newPassword || newPassword.length < 6) { setError("密码至少6位"); return; }
    if (newPassword !== confirmPassword) { setError("两次密码不一致"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: contact, code, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("密码重置成功，正在跳转登录...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("重置失败，请重试");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-10 bg-linear-to-br from-amber-50/50 via-background to-sky-50/30 dark:from-amber-950/10 dark:via-background dark:to-sky-950/10">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
            <Link href="/login"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回登录" : "Back to Login"}</Link>
          </Button>
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Mountain className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold bg-linear-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                {locale === "zh" ? "智游清远" : "SmartTravel"}
              </span>
            </Link>
          </div>
          <h1 className="text-xl font-bold mb-1">{locale === "zh" ? "找回密码" : "Reset Password"}</h1>
          <p className="text-sm text-muted-foreground">{locale === "zh" ? "通过手机号或邮箱验证身份" : "Verify via phone or email"}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 1 ? "text-emerald-600" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
              {step > 1 ? <CheckCircle2 className="h-3.5 w-3.5" /> : "1"}
            </div>
            {locale === "zh" ? "验证身份" : "Verify"}
          </div>
          <div className={`w-8 h-px ${step >= 2 ? "bg-emerald-600" : "bg-border"}`} />
          <div className={`flex items-center gap-1.5 text-xs font-medium ${step >= 2 ? "text-emerald-600" : "text-muted-foreground"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>2</div>
            {locale === "zh" ? "重置密码" : "Reset"}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl p-6">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
                <button onClick={() => { setContactType("phone"); setContact(""); setError(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${contactType === "phone" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                  <Phone className="h-3.5 w-3.5" />{locale === "zh" ? "手机号" : "Phone"}
                </button>
                <button onClick={() => { setContactType("email"); setContact(""); setError(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${contactType === "email" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                  <Mail className="h-3.5 w-3.5" />{locale === "zh" ? "邮箱" : "Email"}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">{contactType === "phone" ? "手机号" : "邮箱"}</label>
                <div className="relative">
                  {contactType === "phone" ? <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> : <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
                  <input
                    type={contactType === "phone" ? "tel" : "email"}
                    value={contact}
                    onChange={(e) => setContact(contactType === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 11) : e.target.value)}
                    placeholder={contactType === "phone" ? "请输入注册手机号" : "请输入注册邮箱"}
                    aria-label={contactType === "phone" ? "手机号" : "邮箱"}
                    title={contactType === "phone" ? "手机号" : "邮箱"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">验证码</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6位验证码" aria-label="验证码" title="验证码" maxLength={6} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  </div>
                  <Button onClick={handleSendCode} disabled={countdown > 0} variant="outline" className="h-[42px] px-4 rounded-xl whitespace-nowrap text-xs">
                    {countdown > 0 ? `${countdown}s` : "获取验证码"}
                  </Button>
                </div>
              </div>

              <Button onClick={handleVerifyAndNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                下一步
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少6位新密码" aria-label="新密码" title="新密码" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" aria-label="确认新密码" title="确认新密码" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" onKeyDown={(e) => e.key === "Enter" && handleResetPassword()} />
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">两次密码不一致</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => { setStep(1); setError(""); }} variant="outline" className="h-11 rounded-xl">上一步</Button>
                <Button onClick={handleResetPassword} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  重置密码
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            想起密码了？<Link href="/login" className="text-emerald-600 hover:underline font-medium">返回登录</Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
