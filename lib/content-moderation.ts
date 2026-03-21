// ═══════════════════════════════════════════════════════════
// AI 内容审核过滤服务 — Content Moderation Service
// 五层过滤：关键词 → 正则模式 → 民族文化敏感 → 垃圾特征 → DeepSeek AI语义分析
// ═══════════════════════════════════════════════════════════

export type ModerationResult = {
  passed: boolean;
  score: number; // 0-100, 越高越安全
  level: "safe" | "review" | "reject";
  flags: ModerationFlag[];
  suggestion?: string;
  aiAnalysis?: DeepSeekAnalysis; // 第五层 DeepSeek AI 语义分析结果
};

export type DeepSeekAnalysis = {
  safe: boolean;
  category: string;
  confidence: number; // 0-1
  reason: string;
  suggestion: string;
  provider: string;
};

export type ModerationFlag = {
  type: ModerationFlagType;
  severity: "low" | "medium" | "high";
  matched: string;
  detail: string;
};

export type ModerationFlagType =
  | "spam"
  | "profanity"
  | "violence"
  | "pornography"
  | "politics"
  | "discrimination"
  | "ethnic_sensitivity"
  | "privacy_leak"
  | "advertising"
  | "misinformation"
  | "contact_info"
  | "repetitive";

// ── 第一层：关键词黑名单过滤 ──
const BLOCKED_KEYWORDS: { words: string[]; type: ModerationFlagType; severity: "low" | "medium" | "high" }[] = [
  {
    words: ["赌博", "赌场", "博彩", "六合彩", "时时彩", "网赌", "赌钱"],
    type: "violence",
    severity: "high",
  },
  {
    words: ["色情", "裸体", "约炮", "一夜情", "援交", "卖淫"],
    type: "pornography",
    severity: "high",
  },
  {
    words: ["枪支", "毒品", "大麻", "冰毒", "海洛因", "炸弹", "暴恐"],
    type: "violence",
    severity: "high",
  },
  {
    words: ["代开发票", "刷单", "兼职日结", "免费领取", "点击链接", "加微信赚钱", "月入过万"],
    type: "advertising",
    severity: "medium",
  },
  {
    words: ["傻逼", "妈的", "他妈", "狗日", "贱人", "废物", "白痴", "脑残"],
    type: "profanity",
    severity: "medium",
  },
];

// ── 第二层：正则模式匹配 ──
const PATTERN_RULES: { pattern: RegExp; type: ModerationFlagType; severity: "low" | "medium" | "high"; detail: string }[] = [
  {
    pattern: /1[3-9]\d{9}/g,
    type: "contact_info",
    severity: "low",
    detail: "检测到手机号码，请注意隐私保护",
  },
  {
    pattern: /\d{6,8}@qq\.com/gi,
    type: "contact_info",
    severity: "low",
    detail: "检测到QQ邮箱",
  },
  {
    pattern: /微信[号:：]?\s*[a-zA-Z0-9_-]{5,20}/g,
    type: "contact_info",
    severity: "low",
    detail: "检测到微信号，建议通过平台私信联系",
  },
  {
    pattern: /(https?:\/\/[^\s]+){3,}/g,
    type: "spam",
    severity: "medium",
    detail: "内容包含过多外部链接",
  },
  {
    pattern: /(.{10,})\1{2,}/g,
    type: "repetitive",
    severity: "medium",
    detail: "检测到大量重复内容",
  },
  {
    pattern: /身份证[号码:：]*\s*\d{15,18}/g,
    type: "privacy_leak",
    severity: "high",
    detail: "检测到身份证号码，严禁泄露个人证件信息",
  },
  {
    pattern: /银行卡[号码:：]*\s*\d{16,19}/g,
    type: "privacy_leak",
    severity: "high",
    detail: "检测到银行卡号码，严禁泄露金融信息",
  },
];

// ── 第三层：民族文化敏感词检测（清远地区特色） ──
const ETHNIC_SENSITIVITY_WORDS: { words: string[]; severity: "medium" | "high"; detail: string }[] = [
  {
    words: ["野人", "蛮族", "落后民族", "未开化"],
    severity: "high",
    detail: "含有对少数民族的歧视性表述，请尊重瑶族、壮族等民族文化",
  },
  {
    words: ["迷信", "原始崇拜", "封建糟粕"],
    severity: "medium",
    detail: "请尊重少数民族的传统信仰和文化习俗",
  },
  {
    words: ["偷拍仪式", "私闯祭祀", "闯入禁区"],
    severity: "medium",
    detail: "部分民族活动和场所需获得许可才能参与或拍摄",
  },
];

// ── 第四层：垃圾内容特征检测 ──
function detectSpamFeatures(text: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];

  // 全大写或大量感叹号
  const exclamationCount = (text.match(/[!！]{2,}/g) || []).length;
  if (exclamationCount > 3) {
    flags.push({
      type: "spam",
      severity: "low",
      matched: "多处连续感叹号",
      detail: "内容包含大量感叹号，可能为垃圾信息",
    });
  }

  // 内容过短但含有链接
  if (text.length < 20 && /https?:\/\//.test(text)) {
    flags.push({
      type: "spam",
      severity: "medium",
      matched: text,
      detail: "内容过短且包含链接，疑似垃圾广告",
    });
  }

  // emoji 轰炸
  const emojiRegex = /[\u{1F600}-\u{1F9FF}]/gu;
  const emojiCount = (text.match(emojiRegex) || []).length;
  if (emojiCount > 20) {
    flags.push({
      type: "spam",
      severity: "low",
      matched: `${emojiCount}个emoji`,
      detail: "内容包含过多表情符号",
    });
  }

  return flags;
}

// ── 主审核函数 ──
export function moderateContent(
  content: string,
  options?: { title?: string; checkEthnicSensitivity?: boolean }
): ModerationResult {
  const text = `${options?.title || ""} ${content}`.toLowerCase();
  const flags: ModerationFlag[] = [];

  // 第一层：关键词过滤
  for (const rule of BLOCKED_KEYWORDS) {
    for (const word of rule.words) {
      if (text.includes(word)) {
        flags.push({
          type: rule.type,
          severity: rule.severity,
          matched: word,
          detail: `内容包含违禁词：${word}`,
        });
      }
    }
  }

  // 第二层：正则模式匹配
  for (const rule of PATTERN_RULES) {
    const matches = text.match(rule.pattern);
    if (matches) {
      flags.push({
        type: rule.type,
        severity: rule.severity,
        matched: matches[0],
        detail: rule.detail,
      });
    }
  }

  // 第三层：民族文化敏感检测（默认开启）
  if (options?.checkEthnicSensitivity !== false) {
    for (const rule of ETHNIC_SENSITIVITY_WORDS) {
      for (const word of rule.words) {
        if (text.includes(word)) {
          flags.push({
            type: "ethnic_sensitivity",
            severity: rule.severity,
            matched: word,
            detail: rule.detail,
          });
        }
      }
    }
  }

  // 第四层：垃圾特征检测
  flags.push(...detectSpamFeatures(content));

  // 计算综合得分
  let score = 100;
  for (const flag of flags) {
    if (flag.severity === "high") score -= 30;
    else if (flag.severity === "medium") score -= 15;
    else score -= 5;
  }
  score = Math.max(0, Math.min(100, score));

  // 判定审核等级
  let level: ModerationResult["level"];
  if (score >= 80) level = "safe";
  else if (score >= 50) level = "review";
  else level = "reject";

  // 生成建议
  let suggestion: string | undefined;
  if (level === "reject") {
    const highFlags = flags.filter((f) => f.severity === "high");
    suggestion = highFlags.length > 0
      ? `内容因包含${highFlags.map((f) => f.detail).join("；")}而被拒绝发布。请修改后重新提交。`
      : "内容不符合社区准则，请检查后重新提交。";
  } else if (level === "review") {
    suggestion = "内容已提交人工审核，审核通过后将自动发布。通常在24小时内完成审核。";
  }

  return { passed: level === "safe", score, level, flags, suggestion };
}

// ═══════════════════════════════════════════════════════════
// 第五层：DeepSeek AI 语义深度分析（异步）
// 使用 OpenAI-compatible API，与智能助手调用方式一致
// ═══════════════════════════════════════════════════════════

const MODERATION_SYSTEM_PROMPT = `你是一个专业的内容安全审核AI。你需要分析用户提交的内容，判断是否符合社区准则。

社区准则（智游清远旅行平台）：
1. 禁止色情、暴力、赌博、毒品等违法内容
2. 禁止人身攻击、歧视性言论
3. 尊重瑶族、壮族等少数民族的文化传统和信仰习俗
4. 禁止虚假旅游信息、恶意差评、不实攻略
5. 禁止广告营销、垃圾信息、刷单引流
6. 保护用户隐私，不得泄露个人信息
7. 鼓励真实、有价值的旅行分享和讨论

请以 JSON 格式返回审核结果：
{
  "safe": true/false,
  "category": "safe|spam|profanity|violence|pornography|discrimination|ethnic_sensitivity|misinformation|advertising|privacy_leak",
  "confidence": 0.0-1.0,
  "reason": "简要说明判断理由(30字以内)",
  "suggestion": "如不安全，给出修改建议(50字以内)"
}

只返回 JSON，不要其他文字。`;

async function callDeepSeekModeration(content: string, title?: string): Promise<DeepSeekAnalysis | null> {
  // 优先使用 DEEPSEEK 专用配置，回退到 OPENAI 兼容配置
  const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.DEEPSEEK_BASE_URL
    || (process.env.DEEPSEEK_API_KEY ? "https://api.deepseek.com/v1" : null)
    || process.env.OPENAI_BASE_URL
    || "https://api.deepseek.com/v1";

  const model = process.env.DEEPSEEK_MODEL
    || (process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : null)
    || process.env.OPENAI_MODEL
    || "deepseek-chat";

  const userMessage = title
    ? `请审核以下内容：\n标题：${title}\n正文：${content}`
    : `请审核以下内容：\n${content}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: MODERATION_SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1, // 低温度保证一致性
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      console.error(`[DeepSeek Moderation] API error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    // 解析 JSON 响应
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[DeepSeek Moderation] Invalid JSON response:", text);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      safe: !!parsed.safe,
      category: parsed.category || "unknown",
      confidence: Math.min(1, Math.max(0, parsed.confidence || 0)),
      reason: parsed.reason || "",
      suggestion: parsed.suggestion || "",
      provider: `${model}@${baseUrl.replace(/https?:\/\//, "").split("/")[0]}`,
    };
  } catch (err) {
    console.error("[DeepSeek Moderation] Error:", err);
    return null;
  }
}

// ── 异步审核（含 DeepSeek AI 第五层）──
// 用于 API 路由中的实时审核
export async function moderateContentWithAI(
  content: string,
  options?: { title?: string; checkEthnicSensitivity?: boolean }
): Promise<ModerationResult> {
  // 先执行前四层本地规则审核
  const localResult = moderateContent(content, options);

  // 如果前四层已判定 reject，直接返回（节省 API 调用）
  if (localResult.level === "reject") {
    return localResult;
  }

  // 第五层：调用 DeepSeek API 做语义深度分析
  const aiAnalysis = await callDeepSeekModeration(content, options?.title);

  if (aiAnalysis) {
    localResult.aiAnalysis = aiAnalysis;

    // AI 判定不安全 → 降低评分
    if (!aiAnalysis.safe && aiAnalysis.confidence >= 0.7) {
      const severityFromAI: "high" | "medium" | "low" =
        aiAnalysis.confidence >= 0.9 ? "high" : aiAnalysis.confidence >= 0.8 ? "medium" : "low";

      localResult.flags.push({
        type: (aiAnalysis.category as ModerationFlagType) || "misinformation",
        severity: severityFromAI,
        matched: `AI:${aiAnalysis.reason}`,
        detail: `[DeepSeek AI] ${aiAnalysis.reason}`,
      });

      // 重新计算得分
      if (severityFromAI === "high") localResult.score -= 30;
      else if (severityFromAI === "medium") localResult.score -= 15;
      else localResult.score -= 5;
      localResult.score = Math.max(0, localResult.score);

      // 重新判定等级
      if (localResult.score >= 80) localResult.level = "safe";
      else if (localResult.score >= 50) localResult.level = "review";
      else localResult.level = "reject";

      localResult.passed = localResult.level === "safe";

      // 更新建议
      if (localResult.level === "reject") {
        localResult.suggestion = aiAnalysis.suggestion || "AI审核判定内容不符合社区准则，请修改后重新提交。";
      } else if (localResult.level === "review") {
        localResult.suggestion = aiAnalysis.suggestion || "AI审核建议人工复审，审核通过后将自动发布。";
      }
    }
  }

  return localResult;
}

// ── 批量审核（用于管理后台） ──
export function moderateBatch(
  items: { id: string; title?: string; content: string }[]
): { id: string; result: ModerationResult }[] {
  return items.map((item) => ({
    id: item.id,
    result: moderateContent(item.content, { title: item.title }),
  }));
}

// ── 批量异步审核（含 DeepSeek AI） ──
export async function moderateBatchWithAI(
  items: { id: string; title?: string; content: string }[]
): Promise<{ id: string; result: ModerationResult }[]> {
  const results = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      result: await moderateContentWithAI(item.content, { title: item.title }),
    }))
  );
  return results;
}

// ── 审核统计类型 ──
export type ModerationStats = {
  total: number;
  safe: number;
  review: number;
  rejected: number;
  topFlags: { type: ModerationFlagType; count: number }[];
};
