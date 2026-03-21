"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, Lock, Users, FileText, AlertTriangle, CheckCircle2,
  Key, Eye, Server, Clock, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";

const auditLogs = [
  { time: "14:32:05", user: "admin@scenic.com", action: "修改权限", target: "运营组-李经理", level: "warning" },
  { time: "14:28:12", user: "zhang@scenic.com", action: "导出报表", target: "3月财务报表", level: "info" },
  { time: "14:15:33", user: "system", action: "自动备份", target: "全量数据库", level: "info" },
  { time: "13:58:41", user: "wang@scenic.com", action: "登录成功", target: "运营后台", level: "info" },
  { time: "13:45:22", user: "unknown@test.com", action: "登录失败", target: "管理后台(3次)", level: "danger" },
  { time: "13:30:10", user: "admin@scenic.com", action: "新增用户", target: "财务组-赵会计", level: "info" },
];

const rbacRoles = [
  { role: "超级管理员", roleEn: "Super Admin", users: 2, permissions: ["全部权限"], color: "text-red-600" },
  { role: "运营管理员", roleEn: "Ops Admin", users: 5, permissions: ["数据看板", "订单管理", "内容发布"], color: "text-sky-600" },
  { role: "财务人员", roleEn: "Finance", users: 3, permissions: ["财务报表", "收入查看"], color: "text-emerald-600" },
  { role: "客服人员", roleEn: "Support", users: 8, permissions: ["投诉处理", "用户查询"], color: "text-amber-600" },
  { role: "只读访客", roleEn: "Read Only", users: 12, permissions: ["数据查看(脱敏)"], color: "text-muted-foreground" },
];

const complianceItems = [
  { name: "AES-256 数据加密", nameEn: "AES-256 Encryption", status: "pass", desc: "传输层TLS1.3 + 存储层AES-256" },
  { name: "SOC2 Type II 审计", nameEn: "SOC2 Type II Audit", status: "pass", desc: "年度审计通过，报告有效期至2027.03" },
  { name: "GDPR / 个保法合规", nameEn: "GDPR Compliance", status: "pass", desc: "数据主体权利支持，72h泄露通知" },
  { name: "灾备双活架构", nameEn: "DR Active-Active", status: "pass", desc: "华南+华东双AZ，RPO<1min RTO<5min" },
  { name: "渗透测试", nameEn: "Penetration Test", status: "pass", desc: "最近测试: 2026.02.28，0高危漏洞" },
  { name: "日志留存", nameEn: "Log Retention", status: "pass", desc: "操作日志180天，安全日志365天" },
];

export default function SecurityPage() {
  const { locale } = useI18n();
  const [tab, setTab] = useState<"audit" | "rbac" | "compliance">("audit");

  return (
    <main className="flex flex-col min-h-dvh bg-muted/30">
      <div className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-600" />
              {locale === "zh" ? "企业安全与合规中心" : "Enterprise Security & Compliance Center"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{locale === "zh" ? "审计日志 · RBAC权限 · 合规认证" : "Audit Logs · RBAC · Compliance"}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/enterprise">{locale === "zh" ? "返回企业版" : "Back"}</Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "安全评分", labelEn: "Security Score", value: "98/100", color: "text-emerald-600" },
              { icon: Lock, label: "数据泄露", labelEn: "Data Breaches", value: "0", color: "text-sky-600" },
              { icon: Key, label: "活跃用户", labelEn: "Active Users", value: "30", color: "text-violet-600" },
              { icon: Clock, label: "系统可用性", labelEn: "Uptime", value: "99.97%", color: "text-amber-600" },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{locale === "zh" ? k.label : k.labelEn}</span>
                  <k.icon className={`h-4 w-4 ${k.color}`} />
                </div>
                <div className="text-2xl font-bold">{k.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
            {([
              { id: "audit" as const, label: "审计日志", labelEn: "Audit Logs", icon: FileText },
              { id: "rbac" as const, label: "权限管理", labelEn: "RBAC", icon: Users },
              { id: "compliance" as const, label: "合规认证", labelEn: "Compliance", icon: CheckCircle2 },
            ]).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
                <t.icon className="h-3.5 w-3.5" />{locale === "zh" ? t.label : t.labelEn}
              </button>
            ))}
          </div>

          {tab === "audit" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-2">
                {auditLogs.map((log, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border text-xs ${log.level === "danger" ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10" : log.level === "warning" ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10" : "border-border"}`}>
                    <span className="font-mono text-muted-foreground w-16">{log.time}</span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${log.level === "danger" ? "bg-red-500" : log.level === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} />
                    <span className="font-medium w-40 truncate">{log.user}</span>
                    <span className="text-muted-foreground w-20">{log.action}</span>
                    <span className="flex-1 truncate">{log.target}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "rbac" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {rbacRoles.map((r) => (
                  <div key={r.role} className="p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-sm font-bold ${r.color}`}>{locale === "zh" ? r.role : r.roleEn}</h4>
                      <span className="text-xs text-muted-foreground">{r.users} {locale === "zh" ? "位用户" : "users"}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.permissions.map((p) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "compliance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-5">
              <div className="space-y-3">
                {complianceItems.map((c) => (
                  <div key={c.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="text-sm font-bold">{locale === "zh" ? c.name : c.nameEn}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-bold">{locale === "zh" ? "通过" : "PASS"}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
