// ═══════════════════════════════════════════════════════════════════════
// 智能客服知识库 — RAG检索引擎
// 参考: 美团智能客服 / 淘宝万象客服 / GitHub Rasa/Botpress
// 架构: 意图分类 → 实体抽取 → 知识检索(BM25+TF-IDF) → LLM增强生成
// ═══════════════════════════════════════════════════════════════════════

export interface SupportKBEntry {
  id: string;
  category: SupportCategory;
  subcategory: string;
  question: string;
  answer: string;
  keywords: string[];
  relatedIds?: string[];
  priority: number;
}

export type SupportCategory =
  | "account" | "payment" | "trip" | "village" | "map"
  | "forum" | "technical" | "desktop" | "ai"
  | "safety" | "enterprise" | "government" | "general";

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
  account: "账号与认证", payment: "支付与价格", trip: "行程规划",
  village: "村落信息", map: "地图与导航", forum: "社区论坛",
  technical: "技术问题", desktop: "桌面版应用", ai: "AI智能功能",
  safety: "安全与隐私", enterprise: "企业版功能", government: "政务版功能",
  general: "通用问题",
};

// 从分片文件导入并合并
import { ACCOUNT_KB } from "./kb/account";
import { PAYMENT_KB } from "./kb/payment";
import { TRIP_KB } from "./kb/trip";
import { VILLAGE_KB } from "./kb/village";
import { MAP_KB } from "./kb/map";
import { FORUM_KB } from "./kb/forum";
import { TECHNICAL_KB } from "./kb/technical";
import { GENERAL_KB } from "./kb/general";

export const SUPPORT_KNOWLEDGE_BASE: SupportKBEntry[] = [
  ...ACCOUNT_KB, ...PAYMENT_KB, ...TRIP_KB, ...VILLAGE_KB,
  ...MAP_KB, ...FORUM_KB, ...TECHNICAL_KB, ...GENERAL_KB,
];

// ═══════════════════════════════════════════════════════════════════
// 意图分类器 (基于关键词权重 + 模式匹配)
// ═══════════════════════════════════════════════════════════════════

const INTENT_PATTERNS: Record<SupportCategory, RegExp[]> = {
  account: [/注册|登录|密码|验证码|账号|头像|昵称|绑定|注销|手机号|邮箱|个人中心|微信登录|QQ登录/],
  payment: [/支付|付款|退款|价格|费用|余额|扣款|到账|退钱|收费|定价/],
  trip: [/行程|规划|路线|推荐|天数|预算|攻略|景点|游玩|出行|旅游计划|几天/],
  village: [/村落|瑶寨|峰林|上岳|油岭|积庆里|古村|村庄|乡村|民宿|住宿/],
  map: [/地图|导航|路线|位置|坐标|距离|怎么去|交通|自驾|公交|高铁|定位/],
  forum: [/论坛|帖子|评论|点赞|发帖|社区|回复|举报|违规/],
  technical: [/bug|闪退|卡顿|打不开|加载|错误|页面|白屏|浏览器|手机|兼容/],
  desktop: [/桌面版|EXE|安装|客户端|Windows|Mac|Linux|桌面应用/],
  ai: [/AI|小智|智能|聊天|机器人|推荐算法|RAG|模型/],
  safety: [/隐私|安全|数据|泄露|保护|举报|骚扰|投诉/],
  enterprise: [/企业|商家|合作|入驻|B端|管理后台|数据看板/],
  government: [/政务|政府|监管|政策|乡村振兴|文化遗产/],
  general: [/你好|谢谢|帮助|客服|人工|投诉|建议|反馈/],
};

export function classifySupportIntent(query: string): SupportCategory {
  const scores: Record<string, number> = {};
  for (const [cat, patterns] of Object.entries(INTENT_PATTERNS)) {
    scores[cat] = 0;
    for (const p of patterns) {
      const matches = query.match(p);
      if (matches) scores[cat] += matches.length * 2;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return (sorted[0][1] > 0 ? sorted[0][0] : "general") as SupportCategory;
}

// ═══════════════════════════════════════════════════════════════════
// BM25 检索 (复用 retrieval-engine 的分词器)
// ═══════════════════════════════════════════════════════════════════

function tokenize(text: string): string[] {
  const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, " ");
  const tokens: string[] = [];
  const chinese = cleaned.replace(/[a-z0-9\s]/g, "");
  for (let i = 0; i < chinese.length; i++) {
    tokens.push(chinese[i]);
    if (i < chinese.length - 1) tokens.push(chinese.substring(i, i + 2));
  }
  const english = cleaned.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean);
  tokens.push(...english);
  return tokens;
}

export function searchSupportKB(query: string, topK = 5): SupportKBEntry[] {
  const queryTokens = tokenize(query);
  const scored = SUPPORT_KNOWLEDGE_BASE.map((entry) => {
    const docText = `${entry.question} ${entry.answer} ${entry.keywords.join(" ")}`;
    const docTokens = tokenize(docText);
    let score = 0;
    for (const qt of queryTokens) {
      const tf = docTokens.filter((t) => t === qt).length;
      if (tf > 0) score += (tf * 2.5) / (tf + 1.5 + 1.5 * (0.75 * docTokens.length / 200));
    }
    // 关键词精确匹配加分
    for (const kw of entry.keywords) {
      if (query.includes(kw)) score += 3;
    }
    // 优先级加权
    score *= 1 + entry.priority * 0.05;
    return { entry, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.entry);
}

// ═══════════════════════════════════════════════════════════════════
// 快速FAQ匹配 (精确匹配高频问题，<10ms响应)
// ═══════════════════════════════════════════════════════════════════

const QUICK_REPLIES: Record<string, string> = {
  "你好": "你好！我是智游清远智能客服小助手 🤖\n请问有什么可以帮您？您可以问我关于账号、支付、行程规划、村落信息等任何问题。\n\n💡 如需人工客服，请随时说「转人工」。",
  "人工客服": "正在为您转接人工客服，请稍候...\n\n⏰ 人工客服服务时间：09:00-22:00\n当前排队人数：约{queue}人\n预计等待：{wait}分钟",
  "转人工": "正在为您转接人工客服，请稍候...\n\n⏰ 人工客服服务时间：09:00-22:00",
  "谢谢": "不客气！很高兴能帮到您 😊\n如果还有其他问题，随时可以问我。\n\n📝 如果对本次服务满意，请给个好评哦~",
};

export function getQuickReply(query: string): string | null {
  const trimmed = query.trim();
  for (const [key, reply] of Object.entries(QUICK_REPLIES)) {
    if (trimmed === key || trimmed.includes(key)) return reply;
  }
  return null;
}
