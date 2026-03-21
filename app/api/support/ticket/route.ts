import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function genTicketNo(): string {
  const d = new Date();
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `T${yyyymmdd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// POST /api/support/ticket — create a ticket
export async function POST(req: NextRequest) {
  try {
    const { subject, category = "general", userId, firstMessage, metadata } = await req.json();

    // Try DB first, fall back to in-memory
    try {
      const ticket = await (prisma as any).supportTicket.create({
        data: {
          ticketNo: genTicketNo(),
          userId: userId || null,
          subject: subject || firstMessage?.slice(0, 80) || "用户咨询",
          category,
          status: "AI_HANDLING",
          metadata: metadata ? JSON.stringify(metadata) : null,
          messages: firstMessage ? {
            create: { sender: "USER", content: firstMessage },
          } : undefined,
        },
        include: { messages: true },
      });
      return Response.json({ ticket, source: "db" });
    } catch {
      // DB unavailable — return ephemeral ticket
      const ticket = {
        id: `tmp_${Date.now()}`,
        ticketNo: genTicketNo(),
        subject: subject || firstMessage?.slice(0, 80) || "用户咨询",
        category,
        status: "AI_HANDLING",
        createdAt: new Date().toISOString(),
      };
      return Response.json({ ticket, source: "memory" });
    }
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

// GET /api/support/ticket — multiple modes
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const list = req.nextUrl.searchParams.get("list");
  const poll = req.nextUrl.searchParams.get("poll"); // ticketId for polling new messages
  const after = req.nextUrl.searchParams.get("after"); // ISO timestamp for polling

  // Mode 1: List all tickets (for agent console)
  if (list) {
    try {
      const tickets = await (prisma as any).supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, ticketNo: true, subject: true, category: true, status: true, createdAt: true },
      });
      return Response.json({ tickets });
    } catch {
      return Response.json({ tickets: [] });
    }
  }

  // Mode 2: Poll for new messages (for widget real-time updates)
  if (poll) {
    try {
      const where: Record<string, unknown> = { ticketId: poll, sender: { in: ["AGENT", "SYSTEM"] } };
      if (after) where.createdAt = { gt: new Date(after) };
      const newMessages = await (prisma as any).supportMessage.findMany({
        where,
        orderBy: { createdAt: "asc" },
      });
      // Also get current ticket status
      const ticket = await (prisma as any).supportTicket.findUnique({
        where: { id: poll },
        select: { status: true },
      });
      return Response.json({ messages: newMessages, ticketStatus: ticket?.status || null });
    } catch {
      return Response.json({ messages: [], ticketStatus: null });
    }
  }

  // Mode 3: Get single ticket with messages (for agent console detail)
  if (!id) return Response.json({ error: "id required" }, { status: 400 });
  try {
    const ticket = await (prisma as any).supportTicket.findUnique({
      where: { id },
      include: { messages: { orderBy: { createdAt: "asc" } }, agent: { include: { user: { select: { name: true, avatar: true } } } } },
    });
    if (!ticket) return Response.json({ error: "not found" }, { status: 404 });
    return Response.json({ ticket });
  } catch {
    return Response.json({ error: "DB unavailable" }, { status: 503 });
  }
}

// PATCH /api/support/ticket — update status / add agent message / rate ticket
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, agentId, agentMessage, satisfaction } = await req.json();
    if (!id) return Response.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (agentId) updates.agentId = agentId;
    if (satisfaction) updates.satisfaction = satisfaction;
    if (status === "RESOLVED" || status === "CLOSED") updates.closedAt = new Date();

    try {
      await (prisma as any).supportTicket.update({ where: { id }, data: updates });
      if (agentMessage) {
        await (prisma as any).supportMessage.create({
          data: { ticketId: id, sender: agentId ? "AGENT" : "SYSTEM", content: agentMessage },
        });
      }
      return Response.json({ success: true });
    } catch {
      return Response.json({ success: true, source: "noop" });
    }
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
