"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Phone, Mail, Lock, Mountain, ArrowLeft, Loader2, Camera,
  Shield, LogOut, Trash2, CheckCircle2, MapPin, Heart, MessageSquare,
  Bookmark, Route, Settings, Edit3, Calendar, Award, Eye, Star,
  ImageIcon, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileTab = "activity" | "posts" | "favorites" | "trips" | "settings";

export default function ProfilePage() {
  const { locale } = useI18n();
  const { user, token, logout, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>("activity");
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  // Mock stats
  const stats = { posts: 3, favorites: 12, trips: 2, likes: 28, views: 156 };

  useEffect(() => { if (user?.name) setName(user.name); }, [user?.name]);

  if (authLoading) {
    return <main className="min-h-dvh flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Mountain className="h-12 w-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold">{locale === "zh" ? "请先登录" : "Please sign in"}</h2>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
            <Link href="/login">{locale === "zh" ? "去登录" : "Sign In"}</Link>
          </Button>
        </div>
      </main>
    );
  }

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage(text); setMsgType(type); setTimeout(() => setMessage(""), 3000);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { showMsg("昵称不能为空", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      data.success ? showMsg("个人资料已更新", "success") : showMsg(data.message || "更新失败", "error");
    } catch { showMsg("网络错误", "error"); }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { showMsg("新密码至少6位", "error"); return; }
    if (newPassword !== confirmPw) { showMsg("两次密码不一致", "error"); return; }
    setChangingPw(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) { showMsg("密码修改成功", "success"); setOldPassword(""); setNewPassword(""); setConfirmPw(""); }
      else showMsg(data.message || "修改失败", "error");
    } catch { showMsg("网络错误", "error"); }
    setChangingPw(false);
  };

  const handleLogout = async () => { await logout(); router.push("/"); };

  const tabs: { id: ProfileTab; icon: typeof User; label: string; labelEn: string }[] = [
    { id: "activity", icon: MessageSquare, label: "动态", labelEn: "Activity" },
    { id: "posts", icon: Edit3, label: "游记", labelEn: "Posts" },
    { id: "favorites", icon: Bookmark, label: "收藏", labelEn: "Favorites" },
    { id: "trips", icon: Route, label: "行程", labelEn: "Trips" },
    { id: "settings", icon: Settings, label: "设置", labelEn: "Settings" },
  ];

  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN", { year: "numeric", month: "long" }) : "2026年3月";

  return (
    <main className="min-h-dvh bg-background">
      {/* ═══ Cover Banner ═══ */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        <button className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur-sm text-white text-xs hover:bg-black/50 transition-colors flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5" />{locale === "zh" ? "更换封面" : "Change Cover"}
        </button>
        <Button asChild variant="ghost" size="sm" className="absolute top-4 left-4 text-white hover:bg-white/20">
          <Link href="/"><ArrowLeft className="mr-1 h-4 w-4" />{locale === "zh" ? "返回" : "Back"}</Link>
        </Button>
      </div>

      {/* ═══ Profile Header ═══ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative -mt-16 sm:-mt-20 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 border-background bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-xl">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="h-full w-full rounded-full object-cover" />
                ) : (user?.name?.charAt(0) || "U")}
              </div>
              <button className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-card border-2 border-background shadow-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Change avatar">
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">{user?.name}</h1>
                {user?.role === "ADMIN" && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold shrink-0">管理员</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                {editingBio ? (
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder={locale === "zh" ? "写一句个性签名..." : "Write a bio..."} aria-label="个性签名" title="个性签名" className="flex-1 px-3 py-1 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" autoFocus onKeyDown={(e) => e.key === "Enter" && setEditingBio(false)} />
                    <Button size="sm" variant="ghost" onClick={() => setEditingBio(false)} className="text-xs h-7">完成</Button>
                  </div>
                ) : (
                  <button onClick={() => setEditingBio(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                    {bio || (locale === "zh" ? "点击添加个性签名" : "Add a bio")}
                    <Edit3 className="h-3 w-3 opacity-50" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{locale === "zh" ? "清远" : "Qingyuan"}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{locale === "zh" ? `${joinDate}加入` : `Joined ${joinDate}`}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{stats.views} {locale === "zh" ? "次被浏览" : "views"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 shrink-0 self-start sm:self-end pb-1">
              <Button onClick={() => setActiveTab("settings")} variant="outline" size="sm" className="rounded-lg text-xs h-9">
                <Settings className="h-3.5 w-3.5 mr-1.5" />{locale === "zh" ? "编辑资料" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border">
            {[
              { label: locale === "zh" ? "游记" : "Posts", value: stats.posts },
              { label: locale === "zh" ? "收藏" : "Favorites", value: stats.favorites },
              { label: locale === "zh" ? "行程" : "Trips", value: stats.trips },
              { label: locale === "zh" ? "获赞" : "Likes", value: stats.likes },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Tab Navigation ═══ */}
        <div className="border-b border-border mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <nav className="flex gap-0 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {locale === "zh" ? tab.label : tab.labelEn}
              </button>
            ))}
          </nav>
        </div>

        {/* ═══ Toast Message ═══ */}
        <AnimatePresence>
          {message && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mb-6 p-3 rounded-xl text-sm flex items-center gap-2 ${msgType === "success" ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"}`}>
              <CheckCircle2 className="h-4 w-4 shrink-0" />{message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Two-Column Layout ═══ */}
        <div className="flex flex-col lg:flex-row gap-6 pb-16">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ── Activity Tab ── */}
              {activeTab === "activity" && (
                <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[
                    { type: "favorite", text: locale === "zh" ? "收藏了景点「千年瑶寨」" : 'Favorited "Thousand-Year Yao Village"', time: "2小时前", icon: Heart },
                    { type: "trip", text: locale === "zh" ? "创建了行程「清远周末游」" : 'Created trip "Qingyuan Weekend"', time: "1天前", icon: Route },
                    { type: "post", text: locale === "zh" ? "发布了游记「漫步峰林小镇」" : 'Published "Walking in Fenglin Town"', time: "3天前", icon: Edit3 },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{item.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-center py-8 text-sm text-muted-foreground">{locale === "zh" ? "— 已经到底了 —" : "— No more activity —"}</div>
                </motion.div>
              )}

              {/* ── Posts Tab ── */}
              {activeTab === "posts" && (
                <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[
                    { title: locale === "zh" ? "漫步峰林小镇，感受田园慢生活" : "Walking through Fenglin Town", desc: locale === "zh" ? "清远英德的峰林小镇是一个让人放慢脚步的地方，石灰岩地貌形成的群峰环绕..." : "A place that slows you down...", likes: 12, comments: 3, cover: true },
                    { title: locale === "zh" ? "千年瑶寨探秘之旅" : "Exploring Yao Village", desc: locale === "zh" ? "走进连南千年瑶寨，体验原汁原味的瑶族文化..." : "Step into authentic Yao culture...", likes: 8, comments: 1, cover: false },
                  ].map((post, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                      {post.cover && (
                        <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 flex items-center justify-center">
                          <Mountain className="h-12 w-12 text-emerald-300 dark:text-emerald-700" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors mb-2">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.desc}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full rounded-xl">{locale === "zh" ? "发布新游记" : "Write a Post"} <Edit3 className="ml-2 h-4 w-4" /></Button>
                </motion.div>
              )}

              {/* ── Favorites Tab ── */}
              {activeTab === "favorites" && (
                <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["峰林小镇", "千年瑶寨", "上岳古村", "油岭瑶寨", "积庆里"].map((name, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="h-32 bg-gradient-to-br from-emerald-100 to-sky-50 dark:from-emerald-900/20 dark:to-sky-900/10 flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-emerald-300 dark:text-emerald-700" />
                        </div>
                        <div className="p-3">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-emerald-600 transition-colors">{name}</h4>
                          <div className="flex items-center gap-1 mt-1">
                            {[1,2,3,4,5].map((s) => <Star key={s} className={`h-3 w-3 ${s <= 4 ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Trips Tab ── */}
              {activeTab === "trips" && (
                <motion.div key="trips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[
                    { title: locale === "zh" ? "清远周末游" : "Qingyuan Weekend", days: 2, stops: 4, date: "2026-03-20" },
                    { title: locale === "zh" ? "瑶族文化深度游" : "Yao Culture Deep Tour", days: 3, stops: 6, date: "2026-04-05" },
                  ].map((trip, i) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-semibold text-foreground group-hover:text-emerald-600 transition-colors">{trip.title}</h3>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{trip.date}</span>
                        <span>{trip.days}{locale === "zh" ? "天" : " days"}</span>
                        <span>{trip.stops}{locale === "zh" ? "个景点" : " stops"}</span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full rounded-xl">{locale === "zh" ? "创建新行程" : "Plan a Trip"} <Route className="ml-2 h-4 w-4" /></Button>
                </motion.div>
              )}

              {/* ── Settings Tab ── */}
              {activeTab === "settings" && (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Basic Info */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" />{locale === "zh" ? "基本信息" : "Basic Info"}
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">{locale === "zh" ? "昵称" : "Nickname"}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} aria-label="昵称" title="昵称" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      </div>
                      {user?.phone && (
                        <div>
                          <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{locale === "zh" ? "手机号" : "Phone"}</label>
                          <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-xl">{user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}</p>
                        </div>
                      )}
                      {user?.email && (
                        <div>
                          <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{locale === "zh" ? "邮箱" : "Email"}</label>
                          <p className="text-sm text-muted-foreground bg-muted/50 px-4 py-2.5 rounded-xl">{user.email.replace(/(.{2}).+(@.+)/, "$1***$2")}</p>
                        </div>
                      )}
                      <Button onClick={handleSaveProfile} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {locale === "zh" ? "保存修改" : "Save"}
                      </Button>
                    </div>
                  </div>

                  {/* Change Password */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Lock className="h-4 w-4" />{locale === "zh" ? "修改密码" : "Change Password"}
                    </h2>
                    <div className="space-y-3">
                      <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder={locale === "zh" ? "当前密码" : "Current password"} aria-label="当前密码" title="当前密码" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={locale === "zh" ? "新密码（至少6位）" : "New password (min 6)"} aria-label="新密码" title="新密码" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder={locale === "zh" ? "确认新密码" : "Confirm new password"} aria-label="确认新密码" title="确认新密码" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
                      <Button onClick={handleChangePassword} disabled={changingPw} variant="outline" className="rounded-xl">
                        {changingPw ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {locale === "zh" ? "修改密码" : "Update Password"}
                      </Button>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4" />{locale === "zh" ? "账号安全" : "Security"}
                    </h2>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18z"/></svg>
                          <span className="text-sm font-medium">{locale === "zh" ? "微信" : "WeChat"}</span>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => window.location.href = "/api/auth/oauth/wechat"}>{locale === "zh" ? "绑定" : "Bind"}</Button>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <svg className="h-5 w-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695C19.378 5.294 16.196 0 12 0 7.805 0 4.622 5.294 4.487 10.076L3.408 12.77c-.322.781-.61 1.545-.803 2.264-.857 3.194-.291 4.865.59 4.865.604 0 1.38-.863 2.109-2.175.26.604.601 1.192 1.014 1.744C4.361 20.904 3.3 22.212 3.3 23.304c0 .381.301.696.692.696 1.56 0 3.593-.384 5.208-.953.6.168 1.23.253 1.868.253.618 0 1.228-.08 1.806-.236 1.602.558 3.606.936 5.147.936.391 0 .692-.315.692-.696 0-1.093-1.062-2.401-3.018-3.837a7.334 7.334 0 001.014-1.744c.729 1.312 1.505 2.175 2.109 2.175.882 0 1.448-1.671.59-4.865z"/></svg>
                          <span className="text-sm font-medium">QQ</span>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => window.location.href = "/api/auth/oauth/qq"}>{locale === "zh" ? "绑定" : "Bind"}</Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 p-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button onClick={handleLogout} variant="outline" className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="mr-2 h-4 w-4" />{locale === "zh" ? "退出登录" : "Sign Out"}
                      </Button>
                      <Button variant="outline" className="rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="mr-2 h-4 w-4" />{locale === "zh" ? "注销账号" : "Delete Account"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═══ Right Sidebar ═══ */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            {/* Achievements */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" />{locale === "zh" ? "成就徽章" : "Achievements"}</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { emoji: "🌱", label: locale === "zh" ? "新手旅者" : "Newbie" },
                  { emoji: "📸", label: locale === "zh" ? "摄影达人" : "Photographer" },
                  { emoji: "🏔️", label: locale === "zh" ? "山野探索" : "Explorer" },
                ].map((badge, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs">
                    <span>{badge.emoji}</span>
                    <span className="text-muted-foreground">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">{locale === "zh" ? "个人信息" : "Info"}</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { icon: MapPin, label: locale === "zh" ? "所在地" : "Location", value: locale === "zh" ? "广东 · 清远" : "Guangdong, Qingyuan" },
                  { icon: Calendar, label: locale === "zh" ? "注册时间" : "Joined", value: joinDate },
                  { icon: User, label: "ID", value: user?.id?.slice(0, 8) + "..." },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <row.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="ml-auto text-foreground font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">{locale === "zh" ? "快捷入口" : "Quick Links"}</h3>
              <div className="space-y-1">
                {[
                  { href: "/", label: locale === "zh" ? "首页" : "Home", icon: Mountain },
                  { href: "/forum", label: locale === "zh" ? "社区论坛" : "Forum", icon: MessageSquare },
                  { href: "/guide", label: locale === "zh" ? "旅游攻略" : "Travel Guide", icon: MapPin },
                ].map((link, i) => (
                  <Link key={i} href={link.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
