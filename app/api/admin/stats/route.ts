import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ══════════════════════════════════════════════════════════════
// 工单统计报表 API — 对标淘宝/京东客服管理后台
// 按时间/类型/状态汇总 + 满意度分析 + 趋势数据
// ══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const range = searchParams.get("range") || "7d"; // 7d | 30d | 90d | all
  const type = searchParams.get("type"); // ticket | ban | forum | overview

  const now = new Date();
  const rangeMap: Record<string, number> = {
    "7d": 7, "30d": 30, "90d": 90, "365d": 365,
  };
  const days = rangeMap[range] || 9999;
  const since = new Date(now.getTime() - days * 86400000);

  try {
    if (type === "ticket" || !type) {
      return NextResponse.json(await getTicketStats(since));
    }
    if (type === "ban") {
      return NextResponse.json(await getBanStats(since));
    }
    if (type === "forum") {
      return NextResponse.json(await getForumStats(since));
    }
    if (type === "overview") {
      const [ticket, ban, forum] = await Promise.all([
        getTicketStats(since),
        getBanStats(since),
        getForumStats(since),
      ]);
      return NextResponse.json({ ticket, ban, forum, generatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("[Admin Stats Error]", err);
    // Return mock stats when DB unavailable
    return NextResponse.json(getMockStats());
  }
}

async function getTicketStats(since: Date) {
  const where = { createdAt: { gte: since } };

  const [total, byStatus, byCategory, byPriority, avgSatisfaction, resolvedByAI, resolvedByAgent] = await Promise.all([
    (prisma as any).supportTicket.count({ where }),
    Promise.all(
      ["AI_HANDLING", "HUMAN_QUEUE", "HUMAN_ACTIVE", "RESOLVED", "CLOSED"].map(async (status) => ({
        status,
        count: await (prisma as any).supportTicket.count({ where: { ...where, status } }),
      }))
    ),
    Promise.all(
      ["account", "payment", "trip", "village", "map", "forum", "technical", "other"].map(async (category) => ({
        category,
        count: await (prisma as any).supportTicket.count({ where: { ...where, category } }),
      }))
    ),
    Promise.all(
      ["LOW", "NORMAL", "HIGH", "URGENT"].map(async (priority) => ({
        priority,
        count: await (prisma as any).supportTicket.count({ where: { ...where, priority } }),
      }))
    ),
    (prisma as any).supportTicket.aggregate({
      where: { ...where, satisfaction: { not: null } },
      _avg: { satisfaction: true },
      _count: { satisfaction: true },
    }),
    (prisma as any).supportTicket.count({ where: { ...where, resolvedBy: "ai" } }),
    (prisma as any).supportTicket.count({ where: { ...where, resolvedBy: { startsWith: "agent:" } } }),
  ]);

  // 计算平均解决时长（已解决工单）
  const resolvedTickets = await (prisma as any).supportTicket.findMany({
    where: { ...where, status: { in: ["RESOLVED", "CLOSED"] }, closedAt: { not: null } },
    select: { createdAt: true, closedAt: true },
    take: 200,
  });
  const avgResolveMinutes = resolvedTickets.length > 0
    ? Math.round(resolvedTickets.reduce((sum: number, t: any) =>
        sum + (new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime()) / 60000, 0
      ) / resolvedTickets.length)
    : 0;

  // 每日趋势
  const dailyTrend = await getDailyTrend(since, "supportTicket");

  return {
    total,
    byStatus: byStatus.filter((s: any) => s.count > 0),
    byCategory: byCategory.filter((c: any) => c.count > 0),
    byPriority,
    satisfaction: {
      avg: avgSatisfaction._avg?.satisfaction || 0,
      count: avgSatisfaction._count?.satisfaction || 0,
    },
    resolution: {
      aiResolved: resolvedByAI,
      agentResolved: resolvedByAgent,
      aiRate: total > 0 ? Math.round((resolvedByAI / Math.max(1, resolvedByAI + resolvedByAgent)) * 100) : 0,
    },
    avgResolveMinutes,
    dailyTrend,
  };
}

async function getBanStats(since: Date) {
  const where = { createdAt: { gte: since } };
  try {
    const [total, active, byType, appealed] = await Promise.all([
      (prisma as any).userBan.count({ where }),
      (prisma as any).userBan.count({ where: { ...where, status: "ACTIVE" } }),
      Promise.all(
        ["ACCOUNT", "POST", "CHAT", "WARNING"].map(async (type) => ({
          type,
          count: await (prisma as any).userBan.count({ where: { ...where, type } }),
        }))
      ),
      (prisma as any).userBan.count({ where: { ...where, status: "APPEALED" } }),
    ]);
    return { total, active, appealed, byType: byType.filter((t: any) => t.count > 0) };
  } catch {
    return { total: 0, active: 0, appealed: 0, byType: [] };
  }
}

async function getForumStats(since: Date) {
  const where = { createdAt: { gte: since } };
  try {
    const [totalPosts, totalComments, publishedPosts, unpublishedPosts] = await Promise.all([
      (prisma as any).forumPost.count({ where }),
      (prisma as any).forumComment.count({ where }),
      (prisma as any).forumPost.count({ where: { ...where, published: true } }),
      (prisma as any).forumPost.count({ where: { ...where, published: false } }),
    ]);
    return {
      totalPosts,
      totalComments,
      publishedPosts,
      unpublishedPosts,
      moderationRate: totalPosts > 0 ? Math.round((unpublishedPosts / totalPosts) * 100) : 0,
    };
  } catch {
    return { totalPosts: 0, totalComments: 0, publishedPosts: 0, unpublishedPosts: 0, moderationRate: 0 };
  }
}

async function getDailyTrend(since: Date, model: string) {
  try {
    const records = await (prisma as any)[model].findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const dayMap: Record<string, number> = {};
    for (const r of records) {
      const day = new Date(r.createdAt).toISOString().slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  } catch {
    return [];
  }
}

function getMockStats() {
  return {
    total: 0,
    byStatus: [],
    byCategory: [],
    byPriority: [],
    satisfaction: { avg: 0, count: 0 },
    resolution: { aiResolved: 0, agentResolved: 0, aiRate: 0 },
    avgResolveMinutes: 0,
    dailyTrend: [],
  };
}
