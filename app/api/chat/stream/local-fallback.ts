import type { KBDocument } from "@/lib/rag/knowledge-base";

/**
 * 本地响应生成器 — 无需LLM API，基于RAG检索结果 + 规则模板
 * 用于: 无API Key降级 / LLM API调用失败降级
 */
export function generateLocalResponse(
  query: string,
  intent: string,
  docs: KBDocument[],
  locale: string
): string {
  // 有RAG文档时，基于文档生成
  if (docs.length > 0) {
    return generateFromDocs(query, intent, docs, locale);
  }
  // 无文档时，使用通用回答
  return locale === "zh"
    ? `感谢您的提问！作为清远旅游AI助手，我建议您可以了解以下内容：\n\n- **峰林小镇** — 喀斯特峰林，温泉度假\n- **千年瑶寨** — 瑶族文化，国家级非遗\n- **上岳古村** — 广府锅耳墙建筑\n- **油岭瑶寨** — 耍歌堂发源地\n- **积庆里** — 英德红茶产区\n\n需要我为您详细介绍哪个村落吗？`
    : `Thank you for your question! As a Qingyuan travel AI guide, here are our featured villages:\n\n- **Fenglin Town** — Karst peaks, hot springs\n- **Nangang Yao Village** — Yao culture, national heritage\n- **Shangyue Village** — Cantonese wok-ear walls\n- **Youling Yao Village** — Song Hall Festival origin\n- **Jiqingli** — Yingde black tea region\n\nWhich village would you like to know more about?`;
}

function generateFromDocs(
  query: string,
  intent: string,
  docs: KBDocument[],
  locale: string
): string {
  const primary = docs[0];
  let content = primary.content;

  // 转换【标题】为 ### 标题
  content = content.replace(/【(.+?)】/g, "\n### $1\n");
  content = content.replace(/^(\d+)\.\s/gm, "- **$1.** ");

  let response = `### ${primary.title}\n\n${content}`;

  // 添加来源标注
  const sources = docs.slice(0, 3).map((d) => d.title);
  response += `\n\n---\n📚 来源: ${sources.join(" | ")}`;

  // 添加后续引导
  const followUp: Record<string, string> = {
    village: "\n\n需要我为您规划前往这个村落的行程吗？",
    culture: "\n\n需要了解更多文化细节或规划文化主题行程吗？",
    food: "\n\n需要推荐特定村落的美食吗？",
    transport: "\n\n需要我规划详细路线吗？",
    photography: "\n\n需要我为您规划摄影路线吗？",
    budget: "\n\n告诉我您的预算，我来定制最优方案！",
    season: "\n\n需要我根据季节推荐行程吗？",
    accommodation: "\n\n需要我帮您推荐具体住宿吗？",
    planning: "\n\n需要我调整行程或查看详细路线吗？",
  };

  response += followUp[intent] || "\n\n还有什么想了解的吗？";
  return response;
}
