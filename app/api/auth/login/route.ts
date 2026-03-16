import { NextRequest, NextResponse } from "next/server";
import { loginWithPassword, loginWithSmsCode } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { loginSchema, parseBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`login:${ip}`, RATE_LIMITS.auth);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "登录尝试过于频繁，请稍后重试" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = parseBody(loginSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    const { method } = parsed.data;

    if (method === "password") {
      const result = await loginWithPassword(parsed.data.account!, parsed.data.password!);
      return NextResponse.json(result, { status: result.success ? 200 : 401 });
    }

    if (method === "sms") {
      const result = await loginWithSmsCode(parsed.data.phone!, parsed.data.code!);
      return NextResponse.json(result, { status: result.success ? 200 : 401 });
    }

    return NextResponse.json({ success: false, message: "不支持的登录方式" }, { status: 400 });
  } catch (error) {
    console.error("[Login Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
