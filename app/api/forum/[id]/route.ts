import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const post = await prisma?.forumPost.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view count
    await prisma?.forumPost.update({ where: { id }, data: { views: { increment: 1 } } });

    return NextResponse.json({ data: post, source: "db", timestamp: Date.now() });
  } catch {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await req.json();

    if (body.action === "vote") {
      const delta = body.delta || 1;
      const post = await prisma?.forumPost.update({
        where: { id },
        data: { votes: { increment: delta } },
      });
      return NextResponse.json({ data: post, source: "db", timestamp: Date.now() });
    }

    if (body.action === "comment") {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");
      const user = token ? await getCurrentUser(token) : null;

      const comment = await prisma?.forumComment.create({
        data: {
          postId: id,
          authorId: user?.id || "anonymous",
          authorName: user?.name || body.author || "匿名",
          authorAvatar: user?.avatar || body.avatar || "",
          content: body.content,
          ...(body.images?.length ? { images: body.images } : {}),
        },
      });
      return NextResponse.json({ data: comment, source: "db", timestamp: Date.now() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[Forum PATCH Error]", error);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
