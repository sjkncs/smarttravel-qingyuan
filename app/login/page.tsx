"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Phone, Mail, Lock, ArrowRight, ArrowLeft, Loader2,
  Smartphone, QrCode, KeyRound, ShieldCheck, Mountain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginMethod = "password" | "sms" | "qrcode";

export default function LoginPage() {
  const { locale } = useI18n();
  const { login: authLogin } = useAuth();
  const router = useRouter();

  // States
  const [method, setMethod] = useState<LoginMethod>("password");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [qrExpired, setQrExpired] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  // Send SMS code
  const handleSendCode = async () => {
    if (countdown > 0) return;
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError(locale === "zh" ? "请输入正确的手机号" : "Invalid phone number");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: phone, type: "sms" }),
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
      setError(locale === "zh" ? "发送失败，请重试" : "Failed to send, please retry");
    }
  };

  // Login handler
  const handleLogin = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      let body: Record<string, string> = {};

      if (method === "password") {
        if (!account || !password) {
          setError(locale === "zh" ? "请填写账号和密码" : "Please enter account and password");
          setLoading(false); return;
        }
        body = { method: "password", account, password };
      } else if (method === "sms") {
        if (!phone || !smsCode) {
          setError(locale === "zh" ? "请填写手机号和验证码" : "Please enter phone and code");
          setLoading(false); return;
        }
        body = { method: "sms", phone, code: smsCode };
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        if (data.token && data.user) authLogin(data.token, data.user);
        setTimeout(() => router.push("/"), 1000);
      } else {
        setError(data.message);
      }
    } catch {
      setError(locale === "zh" ? "登录失败，请重试" : "Login failed");
    }
    setLoading(false);
  };

  // QR code simulation
  const handleQrRefresh = () => {
    setQrExpired(false);
    setTimeout(() => setQrExpired(true), 120000); // 2 min expiry
  };

  const handleThirdPartyLogin = (provider: string) => {
    setSuccess(locale === "zh" ? `正在跳转${provider}授权...` : `Redirecting to ${provider}...`);
    const providerMap: Record<string, string> = {
      "微信": "/api/auth/oauth/wechat",
      "WeChat": "/api/auth/oauth/wechat",
      "QQ": "/api/auth/oauth/qq",
      "GitHub": "https://github.com/login/oauth",
    };
    const url = providerMap[provider];
    if (url) {
      setTimeout(() => { window.location.href = url; }, 500);
    } else {
      setError(locale === "zh" ? `${provider}登录暂未开放` : `${provider} login not available`);
    }
  };

  const tabs: { id: LoginMethod; icon: typeof KeyRound; label: string; labelEn: string }[] = [
    { id: "password", icon: KeyRound, label: "账号密码", labelEn: "Password" },
    { id: "sms", icon: Smartphone, label: "短信验证", labelEn: "SMS Code" },
    { id: "qrcode", icon: QrCode, label: "扫码登录", labelEn: "QR Code" },
  ];

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 py-10 bg-linear-to-br from-emerald-50/50 via-background to-sky-50/30 dark:from-emerald-950/10 dark:via-background dark:to-sky-950/10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md"
      >
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
          <h1 className="text-xl font-bold mb-1">{locale === "zh" ? "欢迎回来" : "Welcome Back"}</h1>
          <p className="text-sm text-muted-foreground">{locale === "zh" ? "登录你的账户，继续探索" : "Sign in to continue exploring"}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl p-6">
          {/* Method Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setMethod(tab.id); setError(""); setSuccess(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  method === tab.id
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {locale === "zh" ? tab.label : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Error / Success Messages */}
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

          {/* Password Login */}
          {method === "password" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "手机号 / 邮箱" : "Phone / Email"}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={locale === "zh" ? "请输入手机号或邮箱" : "Enter phone or email"}
                    aria-label="手机号或邮箱"
                    title="手机号或邮箱"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "密码" : "Password"}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={locale === "zh" ? "请输入密码" : "Enter password"}
                    aria-label="密码"
                    title="密码"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-emerald-600 hover:underline">{locale === "zh" ? "忘记密码？" : "Forgot password?"}</Link>
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {locale === "zh" ? "登录" : "Sign In"}
              </Button>
            </motion.div>
          )}

          {/* SMS Login */}
          {method === "sms" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "手机号" : "Phone"}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder={locale === "zh" ? "请输入手机号" : "Enter phone number"}
                    aria-label="手机号"
                    title="手机号"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "验证码" : "Code"}</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="6位验证码"
                      aria-label="验证码"
                      title="验证码"
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                  <Button
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    variant="outline"
                    className="h-[42px] px-4 rounded-xl whitespace-nowrap text-xs"
                  >
                    {countdown > 0 ? `${countdown}s` : (locale === "zh" ? "获取验证码" : "Get Code")}
                  </Button>
                </div>
              </div>
              <Button onClick={handleLogin} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {locale === "zh" ? "登录 / 注册" : "Sign In / Up"}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center">{locale === "zh" ? "未注册手机号将自动创建账户" : "Unregistered phones will auto-create account"}</p>
            </motion.div>
          )}

          {/* QR Code Login */}
          {method === "qrcode" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center justify-center">
                  {/* Simulated QR Code */}
                  <div className="grid grid-cols-7 gap-[3px] p-4">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-[2px] ${
                          Math.random() > 0.4 ? "bg-foreground" : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  {qrExpired && (
                    <div className="absolute inset-0 bg-card/90 rounded-2xl flex flex-col items-center justify-center">
                      <p className="text-sm text-muted-foreground mb-2">{locale === "zh" ? "二维码已过期" : "QR expired"}</p>
                      <Button size="sm" variant="outline" onClick={handleQrRefresh}>{locale === "zh" ? "刷新" : "Refresh"}</Button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{locale === "zh" ? "使用微信 / QQ 扫码登录" : "Scan with WeChat / QQ"}</p>
              <div className="flex justify-center gap-4">
                <button onClick={() => handleThirdPartyLogin("微信")} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                    <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178L21.35 20.2a.49.49 0 01.177-.555C23.318 18.39 24 16.842 24 15.137c0-3.114-3.268-6.14-7.062-6.28zM13.975 12.2c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.842 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/></svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{locale === "zh" ? "微信" : "WeChat"}</span>
                </button>
                <button onClick={() => handleThirdPartyLogin("QQ")} className="flex flex-col items-center gap-1 group">
                  <div className="p-3 rounded-full bg-sky-50 dark:bg-sky-900/20 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
                    <svg className="h-6 w-6 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695C19.378 5.294 16.196 0 12 0 7.805 0 4.622 5.294 4.487 10.076L3.408 12.77c-.322.781-.61 1.545-.803 2.264-.857 3.194-.291 4.865.59 4.865.604 0 1.38-.863 2.109-2.175.26.604.601 1.192 1.014 1.744C4.361 20.904 3.3 22.212 3.3 23.304c0 .381.301.696.692.696 1.56 0 3.593-.384 5.208-.953.6.168 1.23.253 1.868.253.618 0 1.228-.08 1.806-.236 1.602.558 3.606.936 5.147.936.391 0 .692-.315.692-.696 0-1.093-1.062-2.401-3.018-3.837a7.334 7.334 0 001.014-1.744c.729 1.312 1.505 2.175 2.109 2.175.882 0 1.448-1.671.59-4.865z"/></svg>
                  </div>
                  <span className="text-[11px] text-muted-foreground">QQ</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Divider */}
          {method !== "qrcode" && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">{locale === "zh" ? "或使用第三方登录" : "Or sign in with"}</span>
              </div>
            </div>
          )}

          {/* Third-party Buttons */}
          {method !== "qrcode" && (
            <div className="flex gap-3">
              <button onClick={() => handleThirdPartyLogin("微信")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-green-50 dark:hover:bg-green-900/10 hover:border-green-300 transition-all">
                <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178L21.35 20.2a.49.49 0 01.177-.555C23.318 18.39 24 16.842 24 15.137c0-3.114-3.268-6.14-7.062-6.28zM13.975 12.2c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.842 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/></svg>
                <span className="text-xs font-medium">{locale === "zh" ? "微信" : "WeChat"}</span>
              </button>
              <button onClick={() => handleThirdPartyLogin("QQ")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:border-sky-300 transition-all">
                <svg className="h-5 w-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695C19.378 5.294 16.196 0 12 0 7.805 0 4.622 5.294 4.487 10.076L3.408 12.77c-.322.781-.61 1.545-.803 2.264-.857 3.194-.291 4.865.59 4.865.604 0 1.38-.863 2.109-2.175.26.604.601 1.192 1.014 1.744C4.361 20.904 3.3 22.212 3.3 23.304c0 .381.301.696.692.696 1.56 0 3.593-.384 5.208-.953.6.168 1.23.253 1.868.253.618 0 1.228-.08 1.806-.236 1.602.558 3.606.936 5.147.936.391 0 .692-.315.692-.696 0-1.093-1.062-2.401-3.018-3.837a7.334 7.334 0 001.014-1.744c.729 1.312 1.505 2.175 2.109 2.175.882 0 1.448-1.671.59-4.865z"/></svg>
                <span className="text-xs font-medium">QQ</span>
              </button>
              <button onClick={() => handleThirdPartyLogin("GitHub")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted transition-all">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <span className="text-xs font-medium">GitHub</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? "还没有账号？" : "Don't have an account? "}
            <Link href="/register" className="text-emerald-600 hover:underline font-medium">
              {locale === "zh" ? "立即注册" : "Sign Up"}
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground/60 mt-2">
            {locale === "zh" ? "登录即表示同意《用户协议》和《隐私政策》" : "By signing in, you agree to our Terms and Privacy Policy"}
          </p>
        </div>
      </motion.div>
    </main>
  );
}
