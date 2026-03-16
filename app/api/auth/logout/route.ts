import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      await logout(token);
    }

    return NextResponse.json({ success: true, message: "已退出登录" });
  } catch (error) {
    console.error("[Logout Error]", error);
    return NextResponse.json({ success: true, message: "已退出登录" });
  }
}
