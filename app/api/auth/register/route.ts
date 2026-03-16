import { NextRequest, NextResponse } from "next/server";
import { registerUser, verifyCode } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { registerSchema, parseBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`register:${ip}`, RATE_LIMITS.auth);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "注册请求过于频繁，请稍后重试" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = parseBody(registerSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    const { phone, email, password, code, name } = parsed.data;
    const target = phone || email;

    const codeValid = await verifyCode(target!, code);
    if (!codeValid) {
      return NextResponse.json({ success: false, message: "验证码错误或已过期" }, { status: 400 });
    }

    const result = await registerUser({ phone, email, password, name });
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error("[Register Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
