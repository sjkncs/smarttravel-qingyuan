import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, type SafeUser } from "@/lib/auth";

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: SafeUser) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
  }

  const user = await getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ success: false, message: "登录已过期，请重新登录" }, { status: 401 });
  }

  return handler(req, user);
}
