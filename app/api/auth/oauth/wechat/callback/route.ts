import { NextRequest, NextResponse } from "next/server";
import { getWechatAccessToken, getWechatUserInfo } from "@/lib/oauth-service";
import { signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const savedState = req.cookies.get("oauth_state")?.value;

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/login?error=oauth_invalid", req.url));
    }

    // Exchange code for access token
    const tokenData = await getWechatAccessToken(code);
    if (!tokenData) {
      return NextResponse.redirect(new URL("/login?error=wechat_token_failed", req.url));
    }

    // Get user info
    const userInfo = await getWechatUserInfo(tokenData.access_token, tokenData.openid);
    if (!userInfo) {
      return NextResponse.redirect(new URL("/login?error=wechat_userinfo_failed", req.url));
    }

    // Find or create user
    let user = await prisma?.user.findUnique({ where: { wechatOpenId: tokenData.openid } });

    if (!user) {
      // Create new user from WeChat
      user = await prisma?.user.create({
        data: {
          wechatOpenId: tokenData.openid,
          name: userInfo.nickname || "微信用户",
          avatar: userInfo.headimgurl || undefined,
        },
      });
    }

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=db_unavailable", req.url));
    }

    // Create session
    const token = signToken({ userId: user.id, role: user.role });
    await prisma?.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Redirect to home with token in cookie
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("auth-token", token, {
      httpOnly: false, // accessible by client JS for auth context
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    response.cookies.set("auth-user", JSON.stringify({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    response.cookies.delete("oauth_state");

    return response;
  } catch (error) {
    console.error("[WeChat Callback Error]", error);
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
