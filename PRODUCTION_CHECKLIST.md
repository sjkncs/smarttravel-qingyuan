# 智游清远 SmartTravel — 生产上线缺失清单

> 生成时间: 2026-03-15

---

## ✅ 已完成功能

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户注册 (手机号/邮箱+验证码) | ✅ | `app/register/page.tsx` + `api/auth/register` |
| 用户登录 (密码/短信/扫码) | ✅ | `app/login/page.tsx` + `api/auth/login` |
| 短信验证码 (阿里云SMS) | ✅ | `lib/sms-service.ts` + `api/auth/send-code` |
| 邮件验证码 (Resend) | ✅ | `lib/email-service.ts` |
| 忘记密码/重置密码 | ✅ | `app/forgot-password/page.tsx` + `api/auth/reset-password` |
| 用户中心/个人资料 | ✅ | `app/profile/page.tsx` + `api/auth/update-profile` |
| 修改密码 | ✅ | `api/auth/change-password` |
| 微信 OAuth 登录 | ✅ | `lib/oauth-service.ts` + `api/auth/oauth/wechat` |
| QQ OAuth 登录 | ✅ | `lib/oauth-service.ts` + `api/auth/oauth/qq` |
| JWT + Session 双重验证 | ✅ | `lib/auth.ts` + `lib/api-auth.ts` |
| Prisma ORM 数据库 | ✅ | `prisma/schema.prisma` (15个模型) |
| API 限流 | ✅ | 验证码60秒、登录5次/分钟 |
| 表单无障碍 (aria-label/title) | ✅ | 所有 input 已添加 |
| 密码强度校验 | ✅ | 前端实时显示 |
| 服务条款 & 隐私政策页面 | ✅ | `app/terms` + `app/privacy` |

---

## 🔑 上线前必须配置的环境变量

### 优先级 P0 — 核心功能

| 变量名 | 用途 | 获取方式 |
|--------|------|---------|
| `DATABASE_URL` | PostgreSQL 数据库连接 | [Neon](https://neon.tech) / [Supabase](https://supabase.com) / 自建 |
| `JWT_SECRET` | Token 签名密钥 | 运行 `openssl rand -base64 64` 生成 |
| `NEXT_PUBLIC_BASE_URL` | 站点域名 (OAuth回调) | 你的生产域名，如 `https://smarttravel.com` |
| `NEXT_PUBLIC_SITE_URL` | 站点公开 URL | 同上 |

### 优先级 P1 — 用户认证

| 变量名 | 用途 | 获取方式 |
|--------|------|---------|
| `ALIYUN_ACCESS_KEY_ID` | 阿里云 SMS | [阿里云控制台](https://ram.console.aliyun.com) → 创建 AccessKey |
| `ALIYUN_ACCESS_KEY_SECRET` | 阿里云 SMS | 同上 |
| `ALIYUN_SMS_SIGN_NAME` | 短信签名 | [短信服务控制台](https://dysms.console.aliyun.com) → 添加签名 |
| `ALIYUN_SMS_TEMPLATE_CODE` | 短信模板ID | 同上 → 添加模板 (验证码类) |
| `WECHAT_OAUTH_APP_ID` | 微信登录 | [微信开放平台](https://open.weixin.qq.com) → 创建网站应用 |
| `WECHAT_OAUTH_APP_SECRET` | 微信登录 | 同上 |
| `QQ_APP_ID` | QQ登录 | [QQ互联](https://connect.qq.com) → 创建网站应用 |
| `QQ_APP_KEY` | QQ登录 | 同上 |

### 优先级 P2 — 增值服务

| 变量名 | 用途 | 获取方式 |
|--------|------|---------|
| `RESEND_API_KEY` | 邮件发送 | [Resend](https://resend.com) |
| `OPENAI_API_KEY` | AI 对话/推荐 | OpenAI / DeepSeek / Moonshot 等 |
| `ALIPAY_APP_ID` | 支付宝支付 | [支付宝开放平台](https://open.alipay.com) |
| `WECHAT_MCH_ID` | 微信支付 | [微信支付商户平台](https://pay.weixin.qq.com) |
| `OSS_BUCKET` | 文件/图片存储 | [阿里云 OSS](https://oss.console.aliyun.com) |

---

## ⚠️ 上线前必做事项

### 1. 数据库初始化
```bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 导入种子数据 (可选)
npx prisma db seed
```

### 2. 阿里云短信开通步骤
1. 登录 [阿里云控制台](https://console.aliyun.com)
2. 开通短信服务 → [短信控制台](https://dysms.console.aliyun.com)
3. **添加签名**: 类型选"验证码"，签名名称填"智游清远" (需审核1-2个工作日)
4. **添加模板**: 模板内容填 `您的验证码为${code}，5分钟内有效，请勿泄露。` (需审核)
5. 创建 RAM 子账号 → 授权 `AliyunDysmsFullAccess` → 获取 AccessKey

### 3. 微信开放平台开通步骤
1. 注册 [微信开放平台](https://open.weixin.qq.com) 开发者账号 (需企业资质)
2. 创建"网站应用" → 填写域名和回调地址: `https://你的域名/api/auth/oauth/wechat/callback`
3. 等待审核通过 → 获取 AppID 和 AppSecret

### 4. QQ 互联开通步骤
1. 注册 [QQ互联](https://connect.qq.com) 开发者账号
2. 创建"网站应用" → 回调地址: `https://你的域名/api/auth/oauth/qq/callback`
3. 审核通过 → 获取 APP ID 和 APP KEY

### 5. 安全加固
- [ ] 将 `JWT_SECRET` 替换为64位以上随机字符串
- [ ] 启用 HTTPS (必须，微信/QQ OAuth 要求)
- [ ] 配置 CORS 白名单
- [ ] 设置 `Secure` 和 `HttpOnly` Cookie 属性 (OAuth callback 中已设置)
- [ ] 检查 `.env` 不在 Git 仓库中 (已在 `.gitignore`)

### 6. 部署建议
- **推荐平台**: Vercel (Next.js 原生支持) / 阿里云 / 腾讯云
- **数据库**: Neon (免费PostgreSQL) 或 Supabase
- **域名**: 必须已备案 (中国大陆短信和OAuth审核要求)
- **SSL证书**: 微信/QQ OAuth 强制要求 HTTPS

---

## 📋 可选增强 (后续版本)

| 功能 | 优先级 | 说明 |
|------|--------|------|
| GitHub OAuth | 低 | 已预留按钮，需添加 GitHub OAuth App |
| 苹果登录 (Sign in with Apple) | 低 | iOS用户常用 |
| 图形验证码 (CAPTCHA) | 中 | 防止短信接口被刷 (推荐腾讯云天御/极验) |
| 邮箱验证 (注册后验证) | 低 | 可选的二次验证 |
| 登录日志/异地登录提醒 | 低 | 安全审计 |
| 账号注销功能 | 中 | 法律合规要求 |
| 头像上传 (OSS) | 中 | 需配置阿里云 OSS |
| 多端登录互踢 | 低 | 同一账号仅允许一处登录 |
| 短信发送频率监控 | 中 | 防止恶意刷短信费 |
| 管理后台 (用户管理) | 中 | 管理员审核/封禁用户 |
