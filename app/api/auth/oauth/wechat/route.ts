import { NextResponse } from "next/server";
import { getWechatAuthUrl, isWechatConfigured } from "@/lib/oauth-service";
import crypto from "crypto";

export async function GET() {
  if (!isWechatConfigured()) {
    return NextResponse.json(
      { success: false, message: "微信登录未配置，请联系管理员" },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");

  const response = NextResponse.redirect(getWechatAuthUrl(state));
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
