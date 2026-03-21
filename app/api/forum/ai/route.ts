import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// ══════════════════════════════════════════════════════════════════
// Forum AI API — AI解读 + AI生图 + 自动选模型
// 支持 Gemini / OpenAI / Anthropic，自动选择最优模型
// ══════════════════════════════════════════════════════════════════

interface ProviderConfig {
  name: string;
  textCapable: boolean;
  imageCapable: boolean;
  textQuality: number;   // 1-10
  imageQuality: number;  // 1-10
}

// Auto-select best provider based on available API keys
function getProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];
  const openaiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // Dedicated Image API (e.g., LemonAPI with Gemini image models)
  if (process.env.IMAGE_API_KEY) {
    providers.push({
      name: "image-api",
      textCapable: false,
      imageCapable: true,
      textQuality: 0,
      imageQuality: 10, // Highest priority for image generation
    });
  }

  // Native Gemini API (direct Google endpoint)
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: "gemini-native",
      textCapable: true,
      imageCapable: true,
      textQuality: 8,
      imageQuality: 9,
    });
  }

  // OpenAI-compatible endpoint (text LLM — Claude, GPT, DeepSeek, etc.)
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: "openai-compat",
      textCapable: true,
      imageCapable: false, // Proxy usually doesn't have image models
      textQuality: openaiModel.includes("claude") ? 9 : openaiModel.includes("4o") ? 9 : 7,
      imageQuality: 0,
    });
  }

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      name: "anthropic",
      textCapable: true,
      imageCapable: false,
      textQuality: 9,
      imageQuality: 0,
    });
  }
  return providers;
}

function selectBestProvider(task: "text" | "image"): { provider: ProviderConfig | null; reason: string } {
  const providers = getProviders();
  if (providers.length === 0) return { provider: null, reason: "no_api_key" };

  const capable = providers.filter(p => task === "text" ? p.textCapable : p.imageCapable);
  if (capable.length === 0) return { provider: null, reason: "no_capable_provider" };

  // Sort by quality score for the task
  capable.sort((a, b) => task === "text"
    ? b.textQuality - a.textQuality
    : b.imageQuality - a.imageQuality
  );

  return { provider: capable[0], reason: "auto_selected" };
}

// ── Text: AI Summary / Interpretation ──
async function generateAISummary(title: string, content: string, comments: string[]): Promise<string> {
  const { provider, reason } = selectBestProvider("text");
  if (!provider) return buildLocalSummary(title, content, comments);

  const prompt = `你是一个专业的社区论坛AI助手。请对以下帖子进行简洁的智能解读（100-200字）：

标题：${title}
内容：${content}
${comments.length > 0 ? `\n热门评论：\n${comments.slice(0, 3).join("\n")}` : ""}

要求：
1. 提炼核心观点和关键信息
2. 如涉及旅游景点，补充实用建议
3. 如有争议观点，客观总结各方立场
4. 语气专业友好，使用适当emoji`;

  // Try providers in quality order with fallback chain
  const textProviders = getProviders().filter(p => p.textCapable).sort((a, b) => b.textQuality - a.textQuality);
  for (const p of textProviders) {
    try {
      if (p.name === "anthropic") return await callAnthropic(prompt);
      if (p.name === "gemini-native") return await callGeminiText(prompt);
      if (p.name === "openai-compat") return await callOpenAI(prompt);
    } catch (err) {
      console.error(`[Forum AI Summary - ${p.name} failed]`, err);
      continue;
    }
  }
  return buildLocalSummary(title, content, comments);
}

// ── Image: AI Image Generation ──
async function generateAIImage(title: string, content: string): Promise<{ url: string; model: string } | null> {
  const imagePrompt = `A beautiful travel illustration for a forum post about: "${title}". Style: watercolor travel journal, scenic Chinese countryside village landscape, warm colors, artistic, no text.`;

  // Try providers in quality order with fallback chain
  const imageProviders = getProviders().filter(p => p.imageCapable).sort((a, b) => b.imageQuality - a.imageQuality);
  for (const p of imageProviders) {
    try {
      if (p.name === "image-api") return await callImageAPI(imagePrompt);
      if (p.name === "gemini-native") return await callGeminiImage(imagePrompt);
    } catch (err) {
      console.error(`[Forum AI Image - ${p.name} failed]`, err);
      continue;
    }
  }

  // Final fallback: Pollinations.ai — free AI image generation, no API key needed
  try {
    return await callPollinationsImage(imagePrompt);
  } catch (err) {
    console.error("[Forum AI Image - pollinations failed]", err);
  }
  return null;
}

// ── Dedicated Image API (LemonAPI / Gemini image models via chat completions) ──
async function callImageAPI(prompt: string): Promise<{ url: string; model: string }> {
  const apiKey = process.env.IMAGE_API_KEY!;
  const baseUrl = process.env.IMAGE_API_BASE_URL || "https://new.lemonapi.site/v1";
  const model = process.env.IMAGE_API_MODEL || "[L]gemini-2.5-flash-image";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Image API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract base64 image from markdown: ![image](data:image/png;base64,...)
  const b64Match = content.match(/data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/);
  if (b64Match) {
    const mimeType = `image/${b64Match[1]}`;
    const savedUrl = await saveBase64Image(b64Match[2], mimeType);
    return { url: savedUrl, model };
  }

  // Extract URL if response contains an image URL
  const urlMatch = content.match(/https?:\/\/[^\s"'<>)]+\.(?:png|jpg|jpeg|webp|gif)/i);
  if (urlMatch) {
    return { url: urlMatch[0], model };
  }

  throw new Error("No image found in API response");
}

// ── OpenAI Text ──
async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // If model is claude-*, skip to local since this is OpenAI endpoint
  if (model.startsWith("claude-")) {
    return await callAnthropic(prompt);
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Anthropic Text ──
async function callAnthropic(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── Gemini Image Generation (Imagen via Gemini API) ──
async function callGeminiImage(prompt: string): Promise<{ url: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = "gemini-2.0-flash-exp";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini Image ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  // Find inline image data in response parts
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      // Save base64 image to file
      const savedUrl = await saveBase64Image(part.inlineData.data, part.inlineData.mimeType);
      return { url: savedUrl, model: "gemini-imagen" };
    }
  }

  throw new Error("No image in Gemini response");
}

// ── Gemini Text Generation ──
async function callGeminiText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY!;
  const model = "gemini-3.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    }),
  });

  if (!res.ok) throw new Error(`Gemini Text ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// ── Save base64 image to public/uploads/ ──
async function saveBase64Image(base64Data: string, mimeType: string): Promise<string> {
  const ext = mimeType.includes("png") ? "png" : mimeType.includes("webp") ? "webp" : "jpg";
  const filename = `ai-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  const buffer = Buffer.from(base64Data, "base64");
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

// ── Pollinations.ai — Free AI Image Generation (no API key) ──
async function callPollinationsImage(prompt: string): Promise<{ url: string; model: string }> {
  const encoded = encodeURIComponent(prompt);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${Date.now()}`;

  // Pollinations returns the image directly — download and save locally
  const res = await fetch(pollinationsUrl, { redirect: "follow" });
  if (!res.ok) throw new Error(`Pollinations ${res.status}`);

  const contentType = res.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error("Pollinations returned non-image");

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  const savedUrl = await saveBase64Image(base64, contentType);
  return { url: savedUrl, model: "pollinations-ai" };
}

// ── OpenAI-compatible Image Generation ──
// Tries multiple image models via the same base URL + API key
async function callOpenAICompatImage(prompt: string): Promise<{ url: string; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY!;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const configuredModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

  // Try image generation models in order of preference
  const imageModels = [
    configuredModel, // user's configured model may support image gen
    "dall-e-3",
    "gpt-image-1",
  ];

  // Strategy 1: /images/generations endpoint
  for (const model of imageModels) {
    try {
      const res = await fetch(`${baseUrl}/images/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024" }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      // Handle base64 response
      if (data.data?.[0]?.b64_json) {
        const savedUrl = await saveBase64Image(data.data[0].b64_json, "image/png");
        return { url: savedUrl, model };
      }
      // Handle URL response
      if (data.data?.[0]?.url) {
        return { url: data.data[0].url, model };
      }
    } catch { continue; }
  }

  // Strategy 2: chat completions with image response (Gemini-style)
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: configuredModel,
        messages: [{ role: "user", content: `Generate an image: ${prompt}` }],
        max_tokens: 4096,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      // Check if response contains image URL
      const urlMatch = content.match(/https?:\/\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp|gif)/i);
      if (urlMatch) {
        return { url: urlMatch[0], model: configuredModel };
      }
    }
  } catch { /* continue to throw */ }

  throw new Error("No image model available on this endpoint");
}

// ── Local fallback summary ──
function buildLocalSummary(title: string, content: string, comments: string[]): string {
  const keywords = extractKeywords(title + " " + content);
  const lines: string[] = [];
  
  if (keywords.length > 0) {
    lines.push(`📌 本帖关键词：${keywords.slice(0, 5).join("、")}`);
  }
  
  const charCount = content.length;
  if (charCount > 200) {
    lines.push(`📝 长文帖（${charCount}字），包含详细描述`);
  }
  
  if (comments.length > 0) {
    lines.push(`💬 已有${comments.length}条回复参与讨论`);
  }
  
  // Extract key points from content
  const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 10);
  if (sentences.length > 2) {
    lines.push(`核心要点：${sentences[0].trim().slice(0, 60)}...`);
  }
  
  return lines.join("\n") || `这是一篇关于「${title.slice(0, 20)}」的帖子，欢迎查看详情和参与讨论。`;
}

function extractKeywords(text: string): string[] {
  const patterns = [
    /清远|连南|英德|佛冈|阳山/g,
    /瑶寨|瑶族|峰林|古村|积庆里|油岭|上岳|南岗/g,
    /攻略|测评|推荐|体验|亲子|摄影|美食|住宿|交通|路线/g,
    /盘王节|长鼓舞|红茶|温泉|漂流|溶洞/g,
  ];
  const found = new Set<string>();
  for (const p of patterns) {
    const matches = text.match(p);
    if (matches) matches.forEach(m => found.add(m));
  }
  return [...found];
}

// ── API Handler ──
export async function POST(req: NextRequest) {
  try {
    const { action, title, content, comments, postId } = await req.json();

    if (action === "summary") {
      const summary = await generateAISummary(title || "", content || "", comments || []);
      const providers = getProviders();
      const { provider } = selectBestProvider("text");
      return NextResponse.json({
        summary,
        provider: provider?.name || "local",
        availableProviders: providers.map(p => p.name),
      });
    }

    if (action === "generate_image") {
      const result = await generateAIImage(title || "", content || "");
      if (!result) {
        return NextResponse.json({
          error: "Image generation unavailable",
          reason: "No image-capable API configured. Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY in .env",
        }, { status: 503 });
      }
      return NextResponse.json({
        imageUrl: result.url,
        model: result.model,
        provider: result.model.includes("gemini") ? "gemini" : "openai",
      });
    }

    if (action === "providers") {
      const providers = getProviders();
      const textBest = selectBestProvider("text");
      const imageBest = selectBestProvider("image");
      return NextResponse.json({
        providers: providers.map(p => ({
          name: p.name,
          text: p.textCapable,
          image: p.imageCapable,
          textQuality: p.textQuality,
          imageQuality: p.imageQuality,
        })),
        bestText: textBest.provider?.name || null,
        bestImage: imageBest.provider?.name || null,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[Forum AI Error]", err);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
