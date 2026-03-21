# 智游清远 — 桌面应用打包指南

## 📋 概述

本项目支持将清远旅游AI助手打包为 **Windows 桌面应用 (.exe)**，
使用 Electron 框架封装 Next.js 全栈应用，提供类似阿里千问/豆包的桌面AI聊天体验。

## 🏗️ 架构

```
electron/
├── main.js       # Electron 主进程 (启动 Next.js server + BrowserWindow)
└── preload.js    # 安全 IPC 桥接 (窗口控制)

app/desktop/
└── page.tsx      # 千问风格桌面 AI 聊天 UI
```

**工作原理：**
1. Electron 启动时，内嵌的 Next.js standalone server 自动运行
2. BrowserWindow 加载 `localhost:3000/desktop` 页面
3. 桌面 UI 通过 `/api/chat` 调用 RAG 增强的 AI 助手
4. 所有网页功能（村落、论坛、地图等）在桌面端同样可用

## 🚀 开发模式

```bash
# 方式1: 分步启动
npm run dev          # 先启动 Next.js dev server
npx electron .       # 再启动 Electron (另一个终端)

# 方式2: 一键启动 (推荐)
npm run electron:dev
```

## 📦 打包 Windows EXE

### 前置条件
- Node.js ≥ 18
- Windows 10/11 x64

### 打包命令

```bash
# 安装程序 (.exe installer, NSIS)
npm run electron:build

# 便携版 (免安装，单个 .exe)
npm run electron:build:portable
```

### 输出目录
打包结果在 `dist-electron/` 下：
- `智游清远 Setup x.x.x.exe` — NSIS 安装程序
- `智游清远 x.x.x.exe` — 便携版

## ⚙️ 配置

### AI 模型 (.env)

```env
# OpenAI 兼容 API (DeepSeek, Moonshot, Zhipu 等)
OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"

# 或使用 Anthropic Claude (推荐更高质量)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_MODEL="claude-sonnet-4-5"
```

### 自定义图标
替换 `public/favicon.ico` 为你的应用图标（推荐 256x256 多分辨率 .ico）。

## 🖥️ 桌面 UI 特性

- **千问风格界面** — 左侧对话历史 + 右侧聊天区
- **多模型切换** — 小智·智能 / 小智·快速 / 小智 Pro
- **快捷提问** — 行程规划、村落推荐、文化导览等一键提问
- **暗色模式** — 支持明暗主题切换
- **自定义标题栏** — 无边框窗口 + 自定义最小化/最大化/关闭
- **RAG 增强** — BM25 + TF-IDF 混合检索知识库
- **Markdown 渲染** — AI 回复支持富文本展示

## 🌐 网页版同时可用

桌面端不影响网页版功能。用户可通过：
- 网页: `http://localhost:3000` (所有页面)
- 桌面: `/desktop` 路由 (AI 聊天专用 UI)
- 指南页: `/guide` (文化问答 AI)
- 规划页: `/planner` (行程规划 AI)

## ❓ 常见问题

**Q: 打包后 API key 安全吗？**
A: `.env` 文件不会被打包进 EXE。用户需要在应用目录下创建 `.env` 文件。

**Q: 打包体积多大？**
A: Electron + Next.js standalone 约 150-200MB。使用便携版可减少体积。

**Q: 支持 macOS / Linux 吗？**
A: 修改 `electron:build` 脚本的 `--win` 为 `--mac` 或 `--linux` 即可。
