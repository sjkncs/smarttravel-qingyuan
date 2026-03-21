# 智游清远微信小程序

基于 **Taro 4 + React 18** 的跨端小程序，与 Next.js 主站共享后端 API。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Taro 4](https://github.com/NervJS/taro) (京东开源，GitHub 35k+ ⭐) |
| UI 层 | React 18 + TypeScript |
| 样式 | SCSS + rpx 自适应 |
| 构建 | Webpack 5 |
| 后端 | 复用主站 Next.js API Routes |
| AI | DeepSeek API (内容审核 + 智能助手) |

## 项目结构

```
miniprogram/
├── config/              # Taro 编译配置
│   └── index.ts
├── src/
│   ├── app.config.ts    # 全局配置 (pages, tabBar, window)
│   ├── app.ts           # 入口
│   ├── app.scss         # 全局样式
│   ├── assets/          # 静态资源 (tabBar 图标等)
│   ├── utils/
│   │   └── api.ts       # API 请求层 (共享主站接口)
│   └── pages/
│       ├── index/       # 首页 — 推荐村落 + 快捷入口 + 热门帖子
│       ├── explore/     # 发现 — 村落列表 + 搜索 + 分类筛选 + RAI/CPI/VSI 评分
│       ├── ai/          # AI助手 — 智能对话 + 行程规划 + 快捷问题
│       ├── forum/       # 社区 — 帖子列表 + 发帖(含AI审核) + AI解读
│       ├── profile/     # 我的 — 登录/微信登录 + 订单/行程/足迹/收藏
│       ├── village/     # 村落详情 — 评分/简介/活动/交通/收藏
│       └── shop/        # 特产商城 — 分类 + 商品卡片 + 产地直发
├── project.config.json  # 微信开发者工具配置
├── babel.config.js
├── tsconfig.json
└── package.json
```

## 功能集成

小程序集成了主站的所有核心功能：

| 功能 | 对应API | 小程序页面 |
|------|---------|-----------|
| 村落发现 | `/api/villages` | explore + village/detail |
| AI行程规划 | `/api/ai/recommend` | ai (对话界面) |
| 论坛社区 | `/api/forum` | forum (含发帖+AI审核) |
| AI内容审核 | `/api/ai/moderation` | forum (发帖时自动触发) |
| AI解读 | `/api/forum/ai` | forum (帖子AI总结) |
| 用户系统 | `/api/auth/*` | profile (微信登录) |
| 特产商城 | — | shop (本地mock数据) |

## 快速开始

```bash
# 1. 进入小程序目录
cd miniprogram

# 2. 安装依赖
npm install

# 3. 开发模式 (微信小程序)
npm run dev:weapp

# 4. 打开微信开发者工具，导入 miniprogram/dist/weapp 目录

# 5. 构建生产版本
npm run build:weapp
```

### 多端构建

```bash
npm run dev:h5        # H5 网页版
npm run dev:alipay    # 支付宝小程序
npm run dev:swan      # 百度小程序
npm run dev:tt        # 字节跳动小程序
```

## 环境配置

修改 `src/utils/api.ts` 中的 `BASE_URL`：

```ts
// 开发环境
const BASE_URL = 'http://localhost:3000';

// 生产环境
const BASE_URL = 'https://your-domain.com';
```

## Tab Bar 图标

需要在 `src/assets/` 目录下放置 tabBar 图标 (PNG, 81×81px)：

- `tab-home.png` / `tab-home-active.png`
- `tab-explore.png` / `tab-explore-active.png`
- `tab-ai.png` / `tab-ai-active.png`
- `tab-forum.png` / `tab-forum-active.png`
- `tab-profile.png` / `tab-profile-active.png`

## 为什么选择 Taro？

- **GitHub 35k+ Stars** — 京东开源，社区最活跃的跨端框架
- **React 语法** — 与主站 Next.js 项目共享技术栈和组件逻辑
- **一码多端** — 一套代码编译到微信/支付宝/百度/字节/H5
- **TypeScript** — 完整类型支持，与主站保持一致
- **生态丰富** — 丰富的插件和 UI 库支持
