import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { moderateContentWithAI } from "@/lib/content-moderation";

const typeMap: Record<string, string> = {
  question: "QUESTION",
  discussion: "DISCUSSION",
  guide: "GUIDE",
  review: "REVIEW",
};

const typeMapReverse: Record<string, string> = {
  QUESTION: "question",
  DISCUSSION: "discussion",
  GUIDE: "guide",
  REVIEW: "review",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { published: true };
    if (category && category !== "all" && typeMap[category]) {
      where.type = typeMap[category];
    }

    const posts = await prisma?.forumPost.findMany({
      where,
      include: { comments: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (!posts) throw new Error("DB unavailable");
    const data = posts.map((p) => ({
      id: p.id,
      type: typeMapReverse[p.type] || "discussion",
      title: p.title,
      content: p.content,
      author: p.authorName,
      authorRole: p.authorRole,
      avatar: p.authorAvatar,
      time: formatRelativeTime(p.createdAt),
      votes: p.votes,
      views: p.views,
      commentCount: p.comments.length,
      tags: p.tags,
      images: (p as any).images || [],
      aiSummary: p.aiSummary,
      aiImageUrl: (p as any).aiImageUrl || null,
      comments: p.comments.map((c: any) => ({
        id: c.id,
        author: c.authorName,
        avatar: c.authorAvatar,
        content: c.content,
        time: formatRelativeTime(c.createdAt),
        images: c.images || [],
        likes: c.likes,
      })),
    }));

    return NextResponse.json({ data, source: "db", timestamp: Date.now() });
  } catch (error) {
    console.error("[Forum GET Error]", error);
    const { getPosts, getPostsByCategory } = await import("@/lib/data/forum");
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    if (category && category !== "all") {
      return NextResponse.json({ data: getPostsByCategory(category), source: "fallback", timestamp: Date.now() });
    }
    return NextResponse.json({ data: getPosts(), source: "fallback", timestamp: Date.now() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, title, content, tags, images, aiImageUrl } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    // AI 内容审核过滤（五层：关键词+正则+民族文化+垃圾特征+DeepSeek语义）
    const moderation = await moderateContentWithAI(content, { title });
    if (moderation.level === "reject") {
      return NextResponse.json({
        error: "content_rejected",
        moderation: {
          score: moderation.score,
          level: moderation.level,
          flags: moderation.flags,
          suggestion: moderation.suggestion,
        },
      }, { status: 422 });
    }

    // Try to get authenticated user
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const user = token ? await getCurrentUser(token) : null;

    const needsReview = moderation.level === "review";
    const post = await prisma?.forumPost.create({
      data: {
        type: (typeMap[type] || "DISCUSSION") as "QUESTION" | "DISCUSSION" | "GUIDE" | "REVIEW",
        title,
        content,
        authorId: user?.id || "anonymous",
        authorName: user?.name || body.author || "匿名用户",
        authorRole: body.authorRole || "",
        authorAvatar: user?.avatar || body.avatar || "",
        tags: tags || [],
        published: !needsReview,
        ...(images?.length ? { images } : {}),
        ...(aiImageUrl ? { aiImageUrl } : {}),
      },
    });

    if (!post) throw new Error("DB unavailable");
    return NextResponse.json({
      data: {
        id: post.id,
        type: typeMapReverse[post.type],
        title: post.title,
        content: post.content,
        author: post.authorName,
        authorRole: post.authorRole,
        avatar: post.authorAvatar,
        time: "刚刚",
        votes: 0,
        views: 0,
        commentCount: 0,
        tags: post.tags,
        comments: [],
      },
      source: "db",
      timestamp: Date.now(),
      ...(needsReview ? {
        moderation: {
          needsReview: true,
          score: moderation.score,
          suggestion: moderation.suggestion,
        },
      } : {}),
    }, { status: 201 });
  } catch (error) {
    console.error("[Forum POST Error]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return `${Math.floor(days / 30)}个月前`;
}
