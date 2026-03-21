import { z } from "zod";

// ═══════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════

export const sendCodeSchema = z.object({
  target: z.string().min(1, "请提供手机号或邮箱"),
  type: z.enum(["sms", "email"], { message: "类型必须为 sms 或 email" }),
});

export const registerSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "手机号格式不正确").optional(),
  email: z.string().email("邮箱格式不正确").optional(),
  password: z.string().min(6, "密码至少6位").max(128, "密码最长128位"),
  code: z.string().length(6, "验证码为6位数字"),
  name: z.string().max(50, "昵称最长50字").optional(),
}).refine((d) => d.phone || d.email, { message: "请提供手机号或邮箱" });

export const loginSchema = z.object({
  method: z.enum(["password", "sms"]),
  account: z.string().optional(),
  password: z.string().optional(),
  phone: z.string().optional(),
  code: z.string().optional(),
}).refine(
  (d) => {
    if (d.method === "password") return !!d.account && !!d.password;
    if (d.method === "sms") return !!d.phone && !!d.code;
    return false;
  },
  { message: "请填写完整的登录信息" }
);

// ═══════════════════════════════════
// PAYMENT SCHEMAS
// ═══════════════════════════════════

export const paymentCreateSchema = z.object({
  planId: z.string().min(1, "请选择订阅方案"),
  paymentMethod: z.enum(["alipay", "wechat", "unionpay", "visa", "mastercard"], { message: "不支持的支付方式" }),
  amount: z.number().positive("金额必须大于0"),
  currency: z.string().default("CNY"),
});

// ═══════════════════════════════════
// FORUM SCHEMAS
// ═══════════════════════════════════

export const forumPostSchema = z.object({
  title: z.string().min(2, "标题至少2个字").max(200, "标题最长200字"),
  content: z.string().min(5, "内容至少5个字").max(10000, "内容最长10000字"),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10, "最多10个标签").optional(),
});

export const forumCommentSchema = z.object({
  content: z.string().min(1, "评论不能为空").max(2000, "评论最长2000字"),
  authorName: z.string().max(50).optional(),
});

// ═══════════════════════════════════
// HELPER: parse & return error response
// ═══════════════════════════════════

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; message: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return { success: false, message: firstError?.message || "输入数据无效" };
  }
  return { success: true, data: result.data };
}
