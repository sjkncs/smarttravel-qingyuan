import { NextRequest, NextResponse } from "next/server";
import { createVerificationCode } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import { sendCodeSchema, parseBody } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`send-code:${ip}`, RATE_LIMITS.sendCode);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "请求过于频繁，请稍后重试" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const parsed = parseBody(sendCodeSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    const { target, type } = parsed.data;
    const codeType = type === "sms" ? "SMS" as const : "EMAIL" as const;
    const result = await createVerificationCode(target, codeType);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("[SendCode Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
