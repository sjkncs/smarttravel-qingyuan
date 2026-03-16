<div align="center">

# 🏔️ 智游清远 SmartTravel Qingyuan

**AI驱动的乡村旅游数字化解决方案 | AI-Powered Rural Tourism Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?logo=electron)](https://www.electronjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](license.txt)

<p>
告别盲从，发现你的专属小众秘境<br/>
<em>Say goodbye to crowds. Discover your own hidden paradise.</em>
</p>

</div>

---

## ✨ 功能亮点 | Key Features

### 🤖 AI 智能对话 | AI Chat Engine
- **SSE 流式输出** — 实时逐字生成，媲美 ChatGPT 体验
- **RAG 知识库增强** — BM25 + TF-IDF 混合检索，精准命中清远旅游知识
- **Few-shot + CoT 提示工程** — 高质量、结构化回答
- **三级降级** — LLM API → 本地 RAG → 规则引擎兜底

### 🗺️ 村落发现引擎 | Village Discovery
- **5 大特色村落** — 峰林小镇、千年瑶寨、上岳古村、油岭瑶寨、积庆里
- **RAI 乡村可达性指数** — 交通/信号/基建/无障碍四维评估
- **CPI 文化保护指数** — 非遗濒危度、传承人图谱、文化敏感度
- **CBT 社区受益追踪** — 收入透明分配、在地雇佣、青年回流

### 🧭 智能规划 | Smart Planning
- **AI 行程规划** — 30 秒生成带文化解读的个性化行程
- **实景地图导航** — 集成高德/OpenStreetMap
- **数字人伴游** — AI 导游实时互动

### 🖥️ 桌面应用 | Desktop App
- **Electron 跨平台** — 支持 Windows / macOS / Linux
- **系统托盘** — 最小化到托盘，右键菜单（打开/小窗/设置/关于/退出）
- **小窗模式** — 悬浮小窗快速提问
- **全功能工具栏** — 联网搜索、文件上传、图片上传、语音输入
- **快捷导航卡片** — 一键跳转 AI 规划、村落发现、实景地图等

### 🔐 完整后端 | Full-Stack Backend
- **认证系统** — JWT + bcrypt + 验证码 + OAuth（微信/QQ）
- **PostgreSQL + Prisma ORM** — 15 个数据模型
- **支付集成** — 支付宝/微信/银联/Stripe
- **通知服务** — 阿里云 SMS + Resend 邮件

---

## 🛠️ 技术栈 | Tech Stack

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 16 (App Router) + React 19 |
| **语言** | TypeScript 5.9 |
| **样式** | Tailwind CSS 4.2 + Radix UI + Framer Motion |
| **桌面端** | Electron 33 + electron-builder |
| **数据库** | PostgreSQL + Prisma 7.5 ORM |
| **AI/NLP** | SSE Streaming + RAG (BM25 + TF-IDF) |
| **认证** | JWT + bcrypt + SMS/OAuth |
| **部署** | Vercel / Netlify / Docker |

---

## 📁 项目结构 | Project Structure

```
smarttravel-qingyuan/
├── app/                    # Next.js App Router 页面
│   ├── api/                # API 路由 (认证/支付/AI/村落)
│   ├── desktop/            # 桌面版页面 (Electron)
│   ├── guide/              # AI 导游页
│   ├── map/                # 实景地图
│   ├── planner/            # AI 行程规划
│   ├── villages/           # 村落发现
│   ├── forum/              # 旅行社区
│   ├── enterprise/         # 企业版
│   └── government/         # 政府版
├── components/             # React 组件库
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── navbar.tsx          # 导航栏
│   ├── footer.tsx          # 页脚
│   ├── hero.tsx            # 首页 Hero
│   └── markdown-renderer.tsx # Markdown 渲染器
├── electron/               # Electron 主进程
│   ├── main.js             # 主进程 (托盘/小窗/IPC)
│   └── preload.js          # 预加载脚本
├── lib/                    # 工具库
│   ├── auth.ts             # 认证逻辑
│   ├── prisma.ts           # 数据库客户端
│   └── data/               # 静态数据 (降级用)
├── prisma/                 # 数据库 Schema + 种子数据
├── public/                 # 静态资源
└── scripts/                # 构建脚本
```

---

## 🚀 快速开始 | Getting Started

### 环境要求 | Prerequisites

- **Node.js** 20+
- **npm** 或 **pnpm**
- **PostgreSQL** (可选，有 fallback 数据)

### 安装 | Installation

```bash
git clone https://github.com/sjkncs/smarttravel-qingyuan.git
cd smarttravel-qingyuan
npm install
```

### 配置环境变量 | Environment

```bash
cp .env.example .env
# 编辑 .env 填入数据库URL、JWT密钥等
```

### 开发模式 | Development

```bash
npm run dev
```

浏览器打开 http://localhost:3000

### 生产构建 | Production Build

```bash
npm run build
npm start
```

---

## 🖥️ 桌面版构建 | Desktop App Build

### Windows

```bash
npm run electron:build
```

输出文件在 `dist-electron/` 目录：
- `智游清远 Setup 1.0.0.exe` — NSIS 安装包
- `智游清远 1.0.0.exe` — 免安装便携版

### macOS

```bash
npx cross-env ELECTRON_BUILD=1 next build
npx electron-builder --mac
```

### Linux

```bash
npx cross-env ELECTRON_BUILD=1 next build
npx electron-builder --linux
```

### 桌面版特性 | Desktop Features

| 功能 | 说明 |
|------|------|
| 🔔 系统托盘 | 关闭窗口自动最小化到托盘，右键菜单操作 |
| 📌 小窗模式 | 420×520 悬浮小窗，always-on-top 快速提问 |
| 🌐 联网搜索 | 一键切换 AI 联网/离线模式 |
| 📎 文件上传 | 支持 txt/pdf/doc/md 等文档附件 |
| 🖼️ 图片上传 | 支持 jpg/png/gif/webp 等图片 |
| 🎤 语音输入 | Web Speech API 中文语音识别 |
| ⌨️ 快捷键 | Ctrl+N 新对话, Enter 发送 |
| 🔗 快捷导航 | 底部卡片一键跳转各功能页面 |

---

## 📜 可用脚本 | Available Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Turbopack) |
| `npm run build` | 生产构建 |
| `npm start` | 启动生产服务器 |
| `npm run lint` | ESLint 代码检查 |
| `npm run electron:dev` | 启动 Electron 开发模式 |
| `npm run electron:build` | 构建 Windows 桌面安装包 |
| `npm run db:generate` | 生成 Prisma 客户端 |
| `npm run db:push` | 推送 Schema 到数据库 |
| `npm run db:seed` | 填充种子数据 |
| `npm run db:studio` | 打开 Prisma Studio |

---

## 🌐 页面路由 | Routes

| 路由 | 页面 |
|------|------|
| `/` | 首页 Landing Page |
| `/villages` | 村落发现 |
| `/planner` | AI 行程规划 |
| `/map` | 实景地图 |
| `/guide` | AI 导游伴游 |
| `/forum` | 旅行社区 |
| `/rankings` | 排行榜 |
| `/pricing` | 订阅方案 |
| `/community` | 社区共建 |
| `/desktop` | 桌面版入口 |
| `/enterprise` | 企业版 |
| `/government` | 政府版 |
| `/login` | 登录 |
| `/register` | 注册 |
| `/profile` | 个人主页 |

---

## 🏗️ 架构设计 | Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Electron  │    │   Browser    │    │   Mobile    │
│  Desktop    │    │   Web App    │    │   (PWA)     │
└──────┬──────┘    └──────┬───────┘    └──────┬──────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
              ┌───────────┴───────────┐
              │    Next.js 16 App     │
              │    (App Router)       │
              ├───────────────────────┤
              │  SSE Streaming Chat   │
              │  RAG Knowledge Base   │
              │  BM25 + TF-IDF       │
              ├───────────────────────┤
              │  REST API Routes      │
              │  JWT Auth + OAuth     │
              │  Payment Gateway      │
              ├───────────────────────┤
              │  Prisma ORM           │
              │  PostgreSQL           │
              └───────────────────────┘
```

---

## 📄 License

Distributed under the MIT License. See [license.txt](license.txt) for details.

---

<div align="center">

**智游清远** — 让每一次乡村之旅都充满惊喜

*SmartTravel Qingyuan — Making every rural journey an adventure*

Made with ❤️ by SmartTravel Team | [GitHub](https://github.com/sjkncs) | 📧 2797660051@qq.com

</div>
