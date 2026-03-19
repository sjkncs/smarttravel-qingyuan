<div align="center">

# 🏔️ 智游清远 SmartTravel Qingyuan

### AI 驱动的乡村旅游数字化解决方案

*AI-Powered Smart Rural Tourism Platform for Qingyuan, Guangdong*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Electron](https://img.shields.io/badge/Electron-33-47848F?style=for-the-badge&logo=electron)](https://www.electronjs.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](license.txt)
[![GitHub stars](https://img.shields.io/github/stars/sjkncs/smarttravel-qingyuan?style=flat-square&logo=github)](https://github.com/sjkncs/smarttravel-qingyuan/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/sjkncs/smarttravel-qingyuan?style=flat-square&logo=github)](https://github.com/sjkncs/smarttravel-qingyuan/network)
[![GitHub issues](https://img.shields.io/github/issues/sjkncs/smarttravel-qingyuan?style=flat-square&logo=github)](https://github.com/sjkncs/smarttravel-qingyuan/issues)

<br/>

> 告别盲从，发现你的专属小众秘境
>
> *Say goodbye to crowds. Discover your own hidden paradise.*

<br/>

[在线演示 Demo](http://localhost:3000) · [报告问题 Issues](https://github.com/sjkncs/smarttravel-qingyuan/issues) · [功能建议 Feature Request](https://github.com/sjkncs/smarttravel-qingyuan/issues/new)

</div>

---

## 📊 Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=sjkncs/smarttravel-qingyuan&type=Date)](https://star-history.com/#sjkncs/smarttravel-qingyuan&Date)

</div>

---

## 🌟 项目亮点 | Highlights

| 🤖 **多模型 AI 引擎** | 🎨 **AI 图片生成** |
|:---|:---|
| Claude / GPT / Gemini / DeepSeek / MiniMax 等 10+ 模型，自动选择最优 provider，三级降级保障可用性 | Gemini Image 模型实时生成帖子配图，支持 DALL-E / Pollinations.ai 多通道降级 |

| 💬 **智能客服系统** | 🏘️ **五大村落引擎** |
|:---|:---|
| SSE 流式对话 + RAG 知识库检索 + 意图分类，30+ 篇知识库文档覆盖清远旅游全场景 | 峰林小镇、千年瑶寨、上岳古村、油岭瑶寨、积庆里 — RAI/CPI/CBT 三维评估体系 |

| 📱 **全平台覆盖** | 🔐 **生产级后端** |
|:---|:---|
| Web (Next.js) + Desktop (Electron) + Mobile (PWA)，一套代码多端运行 | JWT 认证 + Prisma ORM (15 模型) + 支付网关 + SMS/邮件通知 |

---

## ✨ 核心功能 | Core Features

### 🤖 AI 智能对话引擎

| 特性 | 描述 |
|------|------|
| **SSE 流式输出** | 实时逐字生成，媲美 ChatGPT 体验 |
| **RAG 知识库** | BM25 + TF-IDF 混合检索，精准命中清远旅游知识 |
| **Few-shot + CoT** | 高质量提示工程，结构化输出 |
| **多模型支持** | Claude Sonnet 4.5 / GPT-4o / Gemini 2.5 / DeepSeek 3.2 |
| **三级降级** | LLM API → 本地 RAG → 规则引擎兜底 |
| **意图分类** | 自动识别用户意图并路由到最佳知识库 |

### 🎨 论坛 AI 图文系统

| 特性 | 描述 |
|------|------|
| **AI 配图生成** | Gemini 2.5 Flash Image 模型，基于帖子标题自动生成水彩风配图 |
| **多图上传** | 支持 JPG/PNG，最大 10MB，拖拽上传 |
| **图片灯箱** | 全屏查看 + 左右导航浏览 |
| **AI 智能解读** | 自动分析帖子内容生成摘要 |
| **B站风格评论** | 折叠展开、@回复、点赞、图片评论 |
| **多 Provider** | IMAGE_API (Gemini) → DALL-E → Pollinations.ai 自动降级 |

### 🗺️ 村落发现引擎

| 指标 | 描述 |
|------|------|
| **RAI 可达性指数** | 交通 / 信号 / 基建 / 无障碍四维评估 |
| **CPI 文化保护指数** | 非遗濒危度、传承人图谱、文化敏感度、承载力 |
| **CBT 社区受益追踪** | 收入透明分配、在地雇佣、青年回流率 |
| **节庆引擎** | 24 节气 × 瑶壮民族节庆 × 农事季节推荐 |

### 🧭 智能规划

- **AI 行程规划** — 30 秒生成带文化解读的个性化行程
- **实景地图** — 集成高德 / OpenStreetMap，16 图层叠加
- **数字人伴游** — AI 导游实时互动讲解

### � 智能客服系统

| 特性 | 描述 |
|------|------|
| **悬浮客服组件** | 全站右下角一键展开，不阻塞页面操作 |
| **快捷问题** | 预置热门旅游 FAQ，一键发送 |
| **知识库问答** | 30+ 篇文档，BM25 检索 + LLM 增强 |
| **SSE 流式** | 实时流式输出，打字机效果 |
| **Markdown 渲染** | 支持富文本回复（表格、列表、代码块） |

### 🖥️ Electron 桌面应用

| 功能 | 说明 |
|------|------|
| 🔔 **系统托盘** | 关闭窗口自动最小化到托盘，右键菜单操作 |
| 📌 **小窗模式** | 420×520 悬浮小窗，always-on-top 快速提问 |
| 🌐 **联网搜索** | 一键切换 AI 联网/离线模式 |
| � **文件上传** | 支持 txt/pdf/doc/md 等文档附件 |
| 🖼️ **图片上传** | 支持 jpg/png/gif/webp 等图片 |
| 🎤 **语音输入** | Web Speech API 中文语音识别 |
| ⌨️ **快捷键** | Ctrl+N 新对话, Enter 发送 |

---

## 🛠️ 技术栈 | Tech Stack

| 层级 | 技术 | 版本 |
|------|------|------|
| **前端框架** | Next.js (App Router) + React | 16 / 19 |
| **语言** | TypeScript | 5.9 |
| **样式** | Tailwind CSS + Radix UI + Framer Motion | 4.2 |
| **桌面端** | Electron + electron-builder | 33 |
| **数据库** | PostgreSQL + Prisma ORM | 7.5 |
| **AI 对话** | SSE Streaming + RAG (BM25 + TF-IDF) | — |
| **AI 图片** | Gemini Image / DALL-E / Pollinations.ai | — |
| **LLM 模型** | Claude / GPT / Gemini / DeepSeek / MiniMax | 多模型 |
| **认证** | JWT + bcrypt + SMS + OAuth | — |
| **支付** | 支付宝 / 微信 / 银联 / Stripe | — |
| **图标** | Lucide React | — |
| **部署** | Vercel / Netlify / Docker | — |

---

## 🏗️ 系统架构 | Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      客户端 Client Layer                      │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Electron │  │   Browser    │  │  Mobile  │  │   PWA   │ │
│  │ Desktop  │  │   Web App    │  │  (响应式) │  │         │ │
│  └────┬─────┘  └──────┬───────┘  └────┬─────┘  └────┬────┘ │
└───────┼───────────────┼───────────────┼──────────────┼──────┘
        └───────────────┼───────────────┘              │
                        ▼                              │
┌──────────────────────────────────────────────────────┼──────┐
│                   Next.js 16 App Router              │      │
│                                                      │      │
│  ┌─────────────────────────────────────────────────┐ │      │
│  │              前端页面 (React 19 + TSX)            │ │      │
│  │                                                 │ │      │
│  │  Landing · Villages · Planner · Map · Forum     │◄┘      │
│  │  Guide · Rankings · Desktop · Enterprise · Gov  │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │              API Routes (/api/*)                  │        │
│  │                                                 │        │
│  │  /chat/stream ─── SSE 流式对话 + RAG 检索        │        │
│  │  /forum/ai ────── AI 解读 + Gemini 图片生成      │        │
│  │  /forum/* ─────── 帖子 CRUD + 评论 + 投票        │        │
│  │  /upload ──────── 图片上传 (JPG/PNG, 10MB)       │        │
│  │  /auth/* ──────── JWT 登录/注册/验证码            │        │
│  │  /payment/* ───── 支付宝/微信/Stripe 支付        │        │
│  │  /villages/* ──── 村落数据 + 详情                │        │
│  │  /ai/* ────────── AI 推荐 + 洞察分析             │        │
│  └──────────┬──────────────────────┬───────────────┘        │
│             │                      │                         │
│             ▼                      ▼                         │
│  ┌──────────────────┐  ┌──────────────────────┐             │
│  │   AI Provider     │  │   Prisma ORM         │             │
│  │   Router          │  │                      │             │
│  │                   │  │  15 Models:          │             │
│  │  Claude ──────┐   │  │  User, Session,      │             │
│  │  GPT-4o ──────┤   │  │  ForumPost,          │             │
│  │  Gemini ──────┤   │  │  ForumComment,       │             │
│  │  DeepSeek ────┤   │  │  Village, Order,     │             │
│  │  MiniMax ─────┘   │  │  TripPlan, etc.      │             │
│  │                   │  │                      │             │
│  │  Image Gen:       │  └──────────┬───────────┘             │
│  │  Gemini Image ─┐  │             │                         │
│  │  DALL-E ───────┤  │             ▼                         │
│  │  Pollinations ─┘  │  ┌──────────────────────┐             │
│  └───────────────────┘  │   PostgreSQL         │             │
│                          │   (+ fallback data)  │             │
│                          └──────────────────────┘             │
└──────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   外部服务 External   │
                    │                     │
                    │  阿里云 SMS         │
                    │  Resend Email       │
                    │  支付宝/微信支付     │
                    │  高德地图 API       │
                    └─────────────────────┘
```

---

## 📁 项目结构 | Project Structure

```
smarttravel-qingyuan/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由层
│   │   ├── auth/                 # 认证 (登录/注册/验证码/OAuth)
│   │   ├── chat/stream/          # SSE 流式 AI 对话
│   │   ├── forum/                # 论坛 CRUD + AI 解读/生图
│   │   │   ├── ai/               #   AI 解读 + Gemini 图片生成
│   │   │   └── [id]/             #   单帖操作 (投票/评论)
│   │   ├── upload/               # 图片上传 (public/uploads/)
│   │   ├── payment/              # 支付创建 + Webhook
│   │   ├── villages/             # 村落数据 API
│   │   ├── ai/                   # AI 推荐 + 洞察
│   │   └── support/              # 客服知识库 API
│   ├── forum/                    # 旅行社区页面
│   ├── support/agent/            # 智能客服专属页面
│   ├── villages/                 # 村落发现页面
│   ├── planner/                  # AI 行程规划
│   ├── map/                      # 实景地图
│   ├── guide/                    # AI 导游伴游
│   ├── desktop/                  # Electron 桌面版页面
│   ├── enterprise/               # 企业版
│   └── government/               # 政府版
├── components/                   # React 组件库
│   ├── ui/                       # shadcn/ui 基础组件
│   ├── support/                  # 客服组件 (悬浮窗/全屏)
│   ├── navbar.tsx                # 导航栏
│   ├── footer.tsx                # 页脚
│   ├── hero.tsx                  # 首页 Hero
│   └── markdown-renderer.tsx     # Markdown 渲染器
├── electron/                     # Electron 主进程
│   ├── main.js                   # 主进程 (托盘/小窗/IPC)
│   └── preload.js                # 预加载脚本
├── lib/                          # 工具库
│   ├── auth.ts                   # JWT + bcrypt 认证
│   ├── prisma.ts                 # Prisma Client 单例
│   ├── i18n.ts                   # 国际化 (zh/en)
│   ├── data/                     # 内存降级数据
│   │   ├── forum.ts              # 论坛帖子数据
│   │   └── villages.ts           # 村落数据
│   └── support/                  # 客服系统
│       ├── rag.ts                # RAG 检索引擎
│       └── kb/                   # 知识库文档 (30+ 篇)
├── prisma/                       # 数据库
│   ├── schema.prisma             # 15 模型 Schema
│   └── seed.ts                   # 种子数据
├── public/                       # 静态资源
│   └── uploads/                  # 用户上传 + AI 生成图片
└── .env.example                  # 环境变量模板
```

---

## 🚀 快速开始 | Getting Started

### 环境要求

- **Node.js** 20+
- **npm** 或 **pnpm**
- **PostgreSQL** (可选 — 内置 fallback 数据可直接运行)

### 1. 克隆项目

```bash
git clone https://github.com/sjkncs/smarttravel-qingyuan.git
cd smarttravel-qingyuan
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

在 `.env` 中配置（均为可选，有降级机制）：

| 变量 | 用途 | 必填 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接 | 否 (有 fallback) |
| `OPENAI_API_KEY` | AI 对话 (Claude/GPT/DeepSeek) | 否 (有本地回复) |
| `OPENAI_BASE_URL` | AI API 端点 | 否 |
| `IMAGE_API_KEY` | AI 图片生成 | 否 (有占位图) |
| `IMAGE_API_BASE_URL` | 图片 API 端点 | 否 |
| `JWT_SECRET` | 认证密钥 | 生产必填 |

### 3. 启动开发

```bash
npm run dev
```

浏览器打开 **http://localhost:3000** 即可体验全部功能

### 4. 生产构建

```bash
npm run build && npm start
```

---

## 🖥️ 桌面版 | Desktop App

### 构建

```bash
# Windows
npm run electron:build

# macOS / Linux
npx cross-env ELECTRON_BUILD=1 next build
npx electron-builder --mac   # 或 --linux
```

输出在 `dist-electron/`：
- **`智游清远 Setup 1.0.0.exe`** — NSIS 安装包
- **`智游清远 1.0.0.exe`** — 便携免安装版

---

## 📜 可用脚本 | Scripts

| 命令 | 说明 |
|------|------|
| `npm run dev` | Turbopack 开发服务器 |
| `npm run build` | 生产构建 |
| `npm start` | 生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run electron:dev` | Electron 开发 |
| `npm run electron:build` | 桌面安装包 |
| `npm run db:generate` | Prisma 客户端 |
| `npm run db:push` | Schema → DB |
| `npm run db:seed` | 种子数据 |
| `npm run db:studio` | Prisma Studio |

---

## 🌐 路由表 | Routes

| 路由 | 页面 | 描述 |
|------|------|------|
| `/` | 首页 | Landing Page + Hero 动画 |
| `/villages` | 村落发现 | 5 村落卡片 + 筛选 + 详情 |
| `/planner` | AI 规划 | 智能行程生成器 |
| `/map` | 实景地图 | 高德/OSM + 16 图层 |
| `/guide` | AI 导游 | 数字人伴游讲解 |
| `/forum` | 旅行社区 | 帖子 + AI 配图 + B站评论 |
| `/support/agent` | 智能客服 | 全屏 AI 客服对话 |
| `/rankings` | 排行榜 | 热门景点排名 |
| `/pricing` | 订阅方案 | SaaS 定价 |
| `/desktop` | 桌面版 | Electron 入口 |
| `/enterprise` | 企业版 | B2B 功能 |
| `/government` | 政府版 | 数据大屏 |

### API 路由

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat/stream` | POST | SSE 流式 AI 对话 + RAG |
| `/api/forum` | GET/POST | 论坛帖子列表 / 创建 |
| `/api/forum/[id]` | GET/PATCH | 单帖详情 / 投票评论 |
| `/api/forum/ai` | POST | AI 解读 + Gemini 图片生成 |
| `/api/upload` | POST | 图片上传 |
| `/api/auth/login` | POST | 登录 (密码/SMS) |
| `/api/auth/register` | POST | 注册 |
| `/api/villages` | GET | 村落列表 |
| `/api/payment/create` | POST | 创建支付订单 |

---

## 🔑 AI Provider 配置 | AI Configuration

本项目支持多 AI 服务商，通过环境变量自动选择最优模型：

```
┌─────────────────────────────────────────────────┐
│              AI Provider Router                  │
│                                                 │
│  文本 (对话/解读):                               │
│    Claude Sonnet 4.5 ─── 质量: ★★★★★           │
│    GPT-4o ────────────── 质量: ★★★★★           │
│    Gemini 2.5 Pro ────── 质量: ★★★★☆           │
│    DeepSeek 3.2 ─────── 质量: ★★★★☆ 性价比高   │
│                                                 │
│  图片 (AI 配图):                                 │
│    Gemini Image (推荐) ── 质量: ★★★★★          │
│    DALL-E 3 ────────────── 质量: ★★★★☆          │
│    Pollinations.ai ────── 免费兜底               │
│                                                 │
│  降级链: 付费 API → 免费 API → 本地规则          │
└─────────────────────────────────────────────────┘
```

---

## 📄 License

Distributed under the **MIT License**. See [license.txt](license.txt) for details.

---

## 🤝 Contributing

欢迎提交 PR 和 Issue！

1. Fork 本仓库
2. 创建 Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit 修改 (`git commit -m 'Add amazing feature'`)
4. Push 分支 (`git push origin feature/amazing-feature`)
5. 发起 Pull Request

---

<div align="center">

<br/>

**🏔️ 智游清远** — 让每一次乡村之旅都充满惊喜

*SmartTravel Qingyuan — Making every rural journey an adventure*

<br/>

Made with ❤️ by [SmartTravel Team](https://github.com/sjkncs)

📧 2797660051@qq.com

<br/>

如果这个项目对你有帮助，请给一个 ⭐️ Star！

*If this project helps you, please give it a ⭐️!*

</div>
