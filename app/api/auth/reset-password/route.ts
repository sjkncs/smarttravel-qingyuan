import { NextRequest, NextResponse } from "next/server";
import { verifyCode, hashPassword } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { parseBody } from "@/lib/validations";

const resetPasswordSchema = z.object({
  target: z.string().min(1, "请提供手机号或邮箱"),
  code: z.string().length(6, "验证码为6位"),
  newPassword: z.string().min(6, "密码至少6位").max(128, "密码最长128位"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`reset-pwd:${ip}`, RATE_LIMITS.auth);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "请求过于频繁，请稍后重试" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = parseBody(resetPasswordSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.message }, { status: 400 });
    }

    const { target, code, newPassword } = parsed.data;

    // Verify code
    const codeValid = await verifyCode(target, code);
    if (!codeValid) {
      return NextResponse.json({ success: false, message: "验证码错误或已过期" }, { status: 400 });
    }

    // Find user by phone or email
    const user = await prisma?.user.findFirst({
      where: { OR: [{ phone: target }, { email: target }] },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "该账号不存在" }, { status: 404 });
    }

    // Update password
    const hashed = await hashPassword(newPassword);
    await prisma?.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    // Invalidate all existing sessions for security
    await prisma?.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ success: true, message: "密码重置成功，请重新登录" });
  } catch (error) {
    console.error("[ResetPassword Error]", error);
    return NextResponse.json({ success: false, message: "服务器错误" }, { status: 500 });
  }
}
