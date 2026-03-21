"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Phone, Mail, Lock, ArrowRight, ArrowLeft, Loader2,
  ShieldCheck, Mountain, CheckCircle2, User, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ContactType = "phone" | "email";

function getPasswordStrength(pw: string): { level: number; label: string; labelEn: string; color: string } {
  if (!pw) return { level: 0, label: "", labelEn: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z\d]/.test(pw)) score++;
  if (score <= 2) return { level: 1, label: "弱", labelEn: "Weak", color: "bg-red-500" };
  if (score <= 3) return { level: 2, label: "中", labelEn: "Medium", color: "bg-amber-500" };
  return { level: 3, label: "强", labelEn: "Strong", color: "bg-emerald-500" };
}

export default function RegisterPage() {
  const { locale } = useI18n();
  const { login: authLogin } = useAuth();
  const router = useRouter();

  const [contactType, setContactType] = useState<ContactType>("phone");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1=verify, 2=set password
  const [agreeTerms, setAgreeTerms] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const strength = getPasswordStrength(password);

  // Validate contact
  const isContactValid = () => {
    if (contactType === "phone") return /^1[3-9]\d{9}$/.test(contact);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  };

  // Send code
  const handleSendCode = async () => {
    if (countdown > 0) return;
    if (!isContactValid()) {
      setError(locale === "zh"
        ? (contactType === "phone" ? "请输入正确的手机号" : "请输入正确的邮箱")
        : (contactType === "phone" ? "Invalid phone number" : "Invalid email"));
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
        setSuccess(locale === "zh" ? "验证码已发送，请查收" : "Code sent, please check");
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
      setError(locale === "zh" ? "发送失败" : "Send failed");
    }
  };

  // Verify code and proceed to step 2
  const handleVerifyAndNext = () => {
    if (!isContactValid()) {
      setError(locale === "zh" ? "请填写正确的联系方式" : "Invalid contact"); return;
    }
    if (!code || code.length < 6) {
      setError(locale === "zh" ? "请输入6位验证码" : "Enter 6-digit code"); return;
    }
    setError("");
    setStep(2);
  };

  // Register
  const handleRegister = async () => {
    setError(""); setSuccess("");

    if (!password || password.length < 6) {
      setError(locale === "zh" ? "密码至少6位" : "Password min 6 chars"); return;
    }
    if (password !== confirmPassword) {
      setError(locale === "zh" ? "两次密码不一致" : "Passwords don't match"); return;
    }
    if (!agreeTerms) {
      setError(locale === "zh" ? "请同意用户协议" : "Please agree to terms"); return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        password,
        code,
        name: nickname || undefined as unknown as string,
      };
      if (contactType === "phone") body.phone = contact;
      else body.email = contact;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(locale === "zh" ? "注册成功，正在跳转..." : "Registered! Redirecting...");
        if (data.token && data.user) authLogin(data.token, data.user);
        setTimeout(() => router.push("/"), 1500);
      } else {
        setError(data.message);
      }
    } catch {
      setError(locale === "zh" ? "注册失败" : "Registration failed");
    }
    setLoading(false);
  };

  const handleThirdPartyBind = (provider: string) => {
    setSuccess(locale === "zh" ? `正在跳转${provider}授权绑定...` : `Redirecting to ${provider} bind...`);
    const providerMap: Record<string, string> = {
      "微信": "/api/auth/oauth/wechat",
      "WeChat": "/api/auth/oauth/wechat",
      "QQ": "/api/auth/oauth/qq",
    };
    const url = providerMap[provider];
    if (url) {
      setTimeout(() => { window.location.href = url; }, 500);
    } else {
      setError(locale === "zh" ? `${provider}绑定暂未开放` : `${provider} binding not available`);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-10 bg-linear-to-br from-emerald-50/50 via-background to-violet-50/30 dark:from-emerald-950/10 dark:via-background dark:to-violet-950/10">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4 text-muted-foreground hover:text-foreground">
            <Link href="/"><ArrowLeft className="mr-1.5 h-4 w-4" />{locale === "zh" ? "返回首页" : "Back to Home"}</Link>
          </Button>
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Mountain className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold bg-linear-to-r from-emerald-700 to-emerald-500 dark:from-emerald-400 dark:to-emerald-300 bg-clip-text text-transparent">
                {locale === "zh" ? "智游清远" : "SmartTravel"}
              </span>
            </Link>
          </div>
          <h1 className="text-xl font-bold mb-1">{locale === "zh" ? "创建账户" : "Create Account"}</h1>
          <p className="text-sm text-muted-foreground">{locale === "zh" ? "开启你的智慧旅行之旅" : "Start your smart travel journey"}</p>
        </div>

        {/* Progress Steps */}
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
            {locale === "zh" ? "设置密码" : "Password"}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl p-6">
          {/* Messages */}
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

          {/* Step 1: Verify */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Contact Type Tabs */}
              <div className="flex gap-1 p-1 rounded-xl bg-muted/50">
                <button
                  onClick={() => { setContactType("phone"); setContact(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${contactType === "phone" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Phone className="h-3.5 w-3.5" />{locale === "zh" ? "手机号" : "Phone"}
                </button>
                <button
                  onClick={() => { setContactType("email"); setContact(""); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${contactType === "email" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
                >
                  <Mail className="h-3.5 w-3.5" />{locale === "zh" ? "邮箱" : "Email"}
                </button>
              </div>

              {/* Contact Input */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {contactType === "phone" ? (locale === "zh" ? "手机号" : "Phone") : (locale === "zh" ? "邮箱" : "Email")}
                </label>
                <div className="relative">
                  {contactType === "phone" ? (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                  <input
                    type={contactType === "phone" ? "tel" : "email"}
                    value={contact}
                    onChange={(e) => setContact(contactType === "phone" ? e.target.value.replace(/\D/g, "").slice(0, 11) : e.target.value)}
                    placeholder={contactType === "phone" ? (locale === "zh" ? "请输入手机号" : "Enter phone") : (locale === "zh" ? "请输入邮箱" : "Enter email")}
                    aria-label={contactType === "phone" ? "手机号" : "邮箱"}
                    title={contactType === "phone" ? "手机号" : "邮箱"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Code Input */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "验证码" : "Verification Code"}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6位验证码"
                      aria-label="验证码"
                      title="验证码"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <Button onClick={handleSendCode} disabled={countdown > 0} variant="outline" className="h-[42px] px-4 rounded-xl whitespace-nowrap text-xs">
                    {countdown > 0 ? `${countdown}s` : (locale === "zh" ? "获取验证码" : "Get Code")}
                  </Button>
                </div>
              </div>

              <Button onClick={handleVerifyAndNext} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                {locale === "zh" ? "下一步" : "Next"} <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Set Password */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Nickname */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "昵称（可选）" : "Nickname (optional)"}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={locale === "zh" ? "给自己取个名字" : "Choose a name"}
                    aria-label="昵称"
                    title="昵称"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "设置密码" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={locale === "zh" ? "至少6位密码" : "Min 6 characters"}
                    aria-label="密码"
                    title="设置密码"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength Indicator */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3].map((l) => (
                        <div key={l} className={`h-1 flex-1 rounded-full ${strength.level >= l ? strength.color : "bg-muted"}`} />
                      ))}
                    </div>
                    <span className={`text-[11px] font-medium ${strength.level === 1 ? "text-red-500" : strength.level === 2 ? "text-amber-500" : "text-emerald-500"}`}>
                      {locale === "zh" ? strength.label : strength.labelEn}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "确认密码" : "Confirm Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={locale === "zh" ? "再次输入密码" : "Re-enter password"}
                    aria-label="确认密码"
                    title="确认密码"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle confirm">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-red-500 mt-1">{locale === "zh" ? "两次密码不一致" : "Passwords don't match"}</p>
                )}
              </div>

              {/* Third-party Bind */}
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" />
                  {locale === "zh" ? "绑定第三方账号（可选）" : "Bind accounts (optional)"}
                </label>
                <div className="flex gap-2">
                  <button onClick={() => handleThirdPartyBind("微信")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 transition-all text-xs">
                    <svg className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/></svg>
                    {locale === "zh" ? "绑定微信" : "WeChat"}
                  </button>
                  <button onClick={() => handleThirdPartyBind("QQ")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:border-sky-300 transition-all text-xs">
                    <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695C19.378 5.294 16.196 0 12 0 7.805 0 4.622 5.294 4.487 10.076L3.408 12.77c-.322.781-.61 1.545-.803 2.264-.857 3.194-.291 4.865.59 4.865.604 0 1.38-.863 2.109-2.175.26.604.601 1.192 1.014 1.744C4.361 20.904 3.3 22.212 3.3 23.304c0 .381.301.696.692.696 1.56 0 3.593-.384 5.208-.953.6.168 1.23.253 1.868.253.618 0 1.228-.08 1.806-.236 1.602.558 3.606.936 5.147.936.391 0 .692-.315.692-.696 0-1.093-1.062-2.401-3.018-3.837a7.334 7.334 0 001.014-1.744c.729 1.312 1.505 2.175 2.109 2.175.882 0 1.448-1.671.59-4.865z"/></svg>
                    {locale === "zh" ? "绑定QQ" : "QQ"}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  aria-label="同意用户协议"
                  title="同意用户协议"
                  className="mt-0.5 h-4 w-4 rounded border-border accent-emerald-600"
                />
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  {locale === "zh"
                    ? "我已阅读并同意《用户服务协议》和《隐私保护政策》"
                    : "I agree to the Terms of Service and Privacy Policy"}
                </span>
              </label>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => { setStep(1); setError(""); }} variant="outline" className="h-11 rounded-xl">
                  {locale === "zh" ? "上一步" : "Back"}
                </Button>
                <Button onClick={handleRegister} disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {locale === "zh" ? "注册" : "Sign Up"}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "已有账号？" : "Already have an account? "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              {locale === "zh" ? "登录" : "Sign In"}
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
