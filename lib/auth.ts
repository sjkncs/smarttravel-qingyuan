import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "smarttravel-dev-secret-change-in-production";
const JWT_EXPIRES_IN = "7d";
const BCRYPT_ROUNDS = 12;

// ═══════════════════════════════════
// PASSWORD HASHING
// ═══════════════════════════════════

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ═══════════════════════════════════
// JWT TOKEN
// ═══════════════════════════════════

export interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════
// SAFE USER (strip password)
// ═══════════════════════════════════

export type SafeUser = Omit<User, "password">;

export function toSafeUser(user: User): SafeUser {
  const { password: _, ...safe } = user;
  return safe;
}

// ═══════════════════════════════════
// REGISTER
// ═══════════════════════════════════

export async function registerUser(data: {
  phone?: string;
  email?: string;
  password: string;
  name?: string;
}): Promise<{ success: boolean; message: string; user?: SafeUser; token?: string }> {
  if (!data.phone && !data.email) {
    return { success: false, message: "请提供手机号或邮箱" };
  }
  if (!data.password || data.password.length < 6) {
    return { success: false, message: "密码至少6位" };
  }

  // Check duplicates
  if (data.phone) {
    const existing = await prisma?.user.findUnique({ where: { phone: data.phone } });
    if (existing) return { success: false, message: "该手机号已注册" };
  }
  if (data.email) {
    const existing = await prisma?.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, message: "该邮箱已注册" };
  }

  const hashedPassword = await hashPassword(data.password);
  const user = await prisma?.user.create({
    data: {
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      name: data.name || (data.phone ? `用户${data.phone.slice(-4)}` : "新用户"),
    },
  });

  if (!user) return { success: false, message: "数据库不可用" };

  const token = signToken({ userId: user.id, role: user.role });

  // Persist session
  await prisma?.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { success: true, message: "注册成功", user: toSafeUser(user), token };
}

// ═══════════════════════════════════
// LOGIN WITH PASSWORD
// ═══════════════════════════════════

export async function loginWithPassword(account: string, password: string): Promise<{
  success: boolean;
  message: string;
  user?: SafeUser;
  token?: string;
}> {
  const user = await prisma?.user.findFirst({
    where: { OR: [{ phone: account }, { email: account }] },
  });

  if (!user || !user.password) {
    return { success: false, message: "账号或密码错误" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { success: false, message: "账号或密码错误" };
  }

  const token = signToken({ userId: user.id, role: user.role });

  await prisma?.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { success: true, message: "登录成功", user: toSafeUser(user), token };
}

// ═══════════════════════════════════
// LOGIN WITH SMS CODE
// ═══════════════════════════════════

export async function loginWithSmsCode(phone: string, code: string): Promise<{
  success: boolean;
  message: string;
  user?: SafeUser;
  token?: string;
  isNewUser?: boolean;
}> {
  // Verify code from DB
  const codeRecord = await prisma?.verificationCode.findFirst({
    where: {
      target: phone,
      code,
      type: "SMS",
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!codeRecord) {
    return { success: false, message: "验证码错误或已过期" };
  }

  // Mark code as used
  await prisma?.verificationCode.update({
    where: { id: codeRecord.id },
    data: { used: true },
  });

  let user = await prisma?.user.findUnique({ where: { phone } });
  let isNewUser = false;

  // Auto-register if not exists
  if (!user) {
    isNewUser = true;
    user = await prisma?.user.create({
      data: {
        phone,
        name: `用户${phone.slice(-4)}`,
      },
    });
  }

  if (!user) return { success: false, message: "数据库不可用" };

  const token = signToken({ userId: user.id, role: user.role });

  await prisma?.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    success: true,
    message: isNewUser ? "注册并登录成功" : "登录成功",
    user: toSafeUser(user),
    token,
    isNewUser,
  };
}

// ═══════════════════════════════════
// VERIFICATION CODES
// ═══════════════════════════════════

export async function createVerificationCode(
  target: string,
  type: "SMS" | "EMAIL"
): Promise<{ success: boolean; message: string; code?: string }> {
  // Validate format
  if (type === "SMS" && !/^1[3-9]\d{9}$/.test(target)) {
    return { success: false, message: "手机号格式不正确" };
  }
  if (type === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
    return { success: false, message: "邮箱格式不正确" };
  }

  // Rate limit: 1 per 60s
  const recent = await prisma?.verificationCode.findFirst({
    where: {
      target,
      type,
      createdAt: { gt: new Date(Date.now() - 60000) },
    },
  });
  if (recent) {
    return { success: false, message: "发送过于频繁，请60秒后重试" };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await prisma?.verificationCode.create({
    data: {
      target,
      code,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    },
  });

  // Send via real service (falls back to console.log in dev mode)
  if (type === "SMS") {
    const { sendSms } = await import("@/lib/sms-service");
    await sendSms(target, code);
  } else {
    const { sendVerificationEmail } = await import("@/lib/email-service");
    await sendVerificationEmail(target, code);
  }

  // Only return code in development mode for testing
  const isDev = process.env.NODE_ENV === "development";
  return { success: true, message: "验证码已发送", code: isDev ? code : undefined };
}

// ═══════════════════════════════════
// VERIFY CODE (standalone)
// ═══════════════════════════════════

export async function verifyCode(target: string, code: string): Promise<boolean> {
  const record = await prisma?.verificationCode.findFirst({
    where: {
      target,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (record) {
    await prisma?.verificationCode.update({
      where: { id: record.id },
      data: { used: true },
    });
    return true;
  }
  return false;
}

// ═══════════════════════════════════
// GET CURRENT USER FROM TOKEN
// ═══════════════════════════════════

export async function getCurrentUser(token: string): Promise<SafeUser | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  // Validate session exists in DB
  const session = await prisma?.session.findUnique({ where: { token } });
  if (!session || session.expiresAt < new Date()) return null;

  const user = await prisma?.user.findUnique({ where: { id: payload.userId } });
  if (!user) return null;

  return toSafeUser(user);
}

// ═══════════════════════════════════
// LOGOUT
// ═══════════════════════════════════

export async function logout(token: string): Promise<void> {
  await prisma?.session.deleteMany({ where: { token } });
}

// ═══════════════════════════════════
// BIND THIRD-PARTY
// ═══════════════════════════════════

export async function bindThirdParty(
  userId: string,
  provider: "wechat" | "qq",
  openId: string
): Promise<{ success: boolean; message: string }> {
  const user = await prisma?.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "用户不存在" };

  const field = provider === "wechat" ? "wechatOpenId" : "qqOpenId";

  await prisma?.user.update({
    where: { id: userId },
    data: { [field]: openId },
  });

  return { success: true, message: `${provider === "wechat" ? "微信" : "QQ"}绑定成功` };
}
