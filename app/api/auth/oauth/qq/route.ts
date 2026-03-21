import { NextResponse } from "next/server";
import { getQQAuthUrl, isQQConfigured } from "@/lib/oauth-service";
import crypto from "crypto";

export async function GET() {
  if (!isQQConfigured()) {
    return NextResponse.json(
      { success: false, message: "QQ登录未配置，请联系管理员" },
      { status: 503 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");

  const response = NextResponse.redirect(getQQAuthUrl(state));
  response.cookies.set("oauth_state_qq", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
