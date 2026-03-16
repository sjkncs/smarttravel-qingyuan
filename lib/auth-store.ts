// In-memory auth store (production should use database)

interface User {
  id: string;
  phone?: string;
  email?: string;
  password: string;
  name: string;
  avatar?: string;
  wechatBound?: boolean;
  qqBound?: boolean;
  createdAt: number;
}

interface VerifyCode {
  code: string;
  target: string;
  type: "sms" | "email";
  expiresAt: number;
  used: boolean;
}

const users: User[] = [
  {
    id: "demo-user-1",
    phone: "18856008931",
    email: "2797660051@qq.com",
    password: "demo123456",
    name: "演示用户",
    avatar: "🧑",
    wechatBound: true,
    qqBound: false,
    createdAt: Date.now(),
  },
];

const verifyCodes: VerifyCode[] = [];

// Generate 6-digit code
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Send SMS verification code
export function sendSmsCode(phone: string): { success: boolean; message: string; code?: string } {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return { success: false, message: "手机号格式不正确" };
  }

  // Check rate limit (1 per 60s)
  const recent = verifyCodes.find(
    (v) => v.target === phone && v.type === "sms" && Date.now() - v.expiresAt + 300000 < 60000
  );
  if (recent) {
    return { success: false, message: "发送过于频繁，请60秒后重试" };
  }

  const code = generateCode();
  verifyCodes.push({
    code,
    target: phone,
    type: "sms",
    expiresAt: Date.now() + 300000, // 5 minutes
    used: false,
  });

  // In production, integrate real SMS API (Aliyun/Tencent Cloud SMS)
  console.log(`[SMS] Sending code ${code} to ${phone}`);

  return { success: true, message: "验证码已发送", code }; // code returned for demo only
}

// Send email verification code
export function sendEmailCode(email: string): { success: boolean; message: string; code?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "邮箱格式不正确" };
  }

  const code = generateCode();
  verifyCodes.push({
    code,
    target: email,
    type: "email",
    expiresAt: Date.now() + 300000,
    used: false,
  });

  console.log(`[Email] Sending code ${code} to ${email}`);

  return { success: true, message: "验证码已发送", code };
}

// Verify code
export function verifyCode(target: string, code: string): boolean {
  const record = verifyCodes.find(
    (v) => v.target === target && v.code === code && !v.used && v.expiresAt > Date.now()
  );
  if (record) {
    record.used = true;
    return true;
  }
  return false;
}

// Register user
export function registerUser(data: {
  phone?: string;
  email?: string;
  password: string;
  name?: string;
}): { success: boolean; message: string; user?: Omit<User, "password"> } {
  if (!data.phone && !data.email) {
    return { success: false, message: "请提供手机号或邮箱" };
  }

  if (data.phone && users.find((u) => u.phone === data.phone)) {
    return { success: false, message: "该手机号已注册" };
  }
  if (data.email && users.find((u) => u.email === data.email)) {
    return { success: false, message: "该邮箱已注册" };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: "密码至少6位" };
  }

  const user: User = {
    id: `user-${Date.now()}`,
    phone: data.phone,
    email: data.email,
    password: data.password, // In production, hash with bcrypt
    name: data.name || (data.phone ? `用户${data.phone.slice(-4)}` : "新用户"),
    avatar: "🧑",
    createdAt: Date.now(),
  };

  users.push(user);

  const { password: _, ...safeUser } = user;
  return { success: true, message: "注册成功", user: safeUser };
}

// Login with password
export function loginWithPassword(account: string, password: string): {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  token?: string;
} {
  const user = users.find(
    (u) => (u.phone === account || u.email === account) && u.password === password
  );

  if (!user) {
    return { success: false, message: "账号或密码错误" };
  }

  const { password: _, ...safeUser } = user;
  const token = `st_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return { success: true, message: "登录成功", user: safeUser, token };
}

// Login with SMS code
export function loginWithSmsCode(phone: string, code: string): {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  token?: string;
  isNewUser?: boolean;
} {
  if (!verifyCode(phone, code)) {
    return { success: false, message: "验证码错误或已过期" };
  }

  let user = users.find((u) => u.phone === phone);
  let isNewUser = false;

  // Auto-register if not exists
  if (!user) {
    isNewUser = true;
    user = {
      id: `user-${Date.now()}`,
      phone,
      password: "", // SMS login users may not have password
      name: `用户${phone.slice(-4)}`,
      avatar: "🧑",
      createdAt: Date.now(),
    };
    users.push(user);
  }

  const { password: _, ...safeUser } = user;
  const token = `st_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return { success: true, message: isNewUser ? "注册并登录成功" : "登录成功", user: safeUser, token, isNewUser };
}

// Bind third-party account
export function bindThirdParty(userId: string, provider: "wechat" | "qq"): {
  success: boolean;
  message: string;
} {
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, message: "用户不存在" };

  if (provider === "wechat") user.wechatBound = true;
  if (provider === "qq") user.qqBound = true;

  return { success: true, message: `${provider === "wechat" ? "微信" : "QQ"}绑定成功` };
}

// Get user by ID
export function getUserById(id: string): Omit<User, "password"> | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}
