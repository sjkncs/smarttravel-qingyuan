import { NextRequest, NextResponse } from "next/server";
import { getQQAccessToken, getQQOpenId, getQQUserInfo } from "@/lib/oauth-service";
import { signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const savedState = req.cookies.get("oauth_state_qq")?.value;

    if (!code || !state || state !== savedState) {
      return NextResponse.redirect(new URL("/login?error=oauth_invalid", req.url));
    }

    // Exchange code for access token
    const tokenData = await getQQAccessToken(code);
    if (!tokenData) {
      return NextResponse.redirect(new URL("/login?error=qq_token_failed", req.url));
    }

    // Get OpenID
    const openIdData = await getQQOpenId(tokenData.access_token);
    if (!openIdData) {
      return NextResponse.redirect(new URL("/login?error=qq_openid_failed", req.url));
    }

    // Get user info
    const userInfo = await getQQUserInfo(tokenData.access_token, openIdData.openid);

    // Find or create user
    let user = await prisma?.user.findUnique({ where: { qqOpenId: openIdData.openid } });

    if (!user) {
      user = await prisma?.user.create({
        data: {
          qqOpenId: openIdData.openid,
          name: userInfo?.nickname || "QQ用户",
          avatar: userInfo?.figureurl_qq_2 || undefined,
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

    // Redirect with auth cookies
    const response = NextResponse.redirect(new URL("/", req.url));
    response.cookies.set("auth-token", token, {
      httpOnly: false,
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
    response.cookies.delete("oauth_state_qq");

    return response;
  } catch (error) {
    console.error("[QQ Callback Error]", error);
    return NextResponse.redirect(new URL("/login?error=server_error", req.url));
  }
}
