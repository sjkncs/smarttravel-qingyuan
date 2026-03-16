/**
 * Validate required environment variables at startup.
 * Logs warnings for missing optional vars, throws for critical ones.
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvVar[] = [
  { key: "DATABASE_URL", required: true, description: "PostgreSQL 数据库连接字符串" },
  { key: "JWT_SECRET", required: true, description: "JWT 签名密钥 (建议64位随机字符串)" },
  { key: "ALIYUN_ACCESS_KEY_ID", required: false, description: "阿里云 SMS AccessKey ID" },
  { key: "ALIYUN_ACCESS_KEY_SECRET", required: false, description: "阿里云 SMS AccessKey Secret" },
  { key: "ALIYUN_SMS_SIGN_NAME", required: false, description: "阿里云 SMS 签名名称" },
  { key: "ALIYUN_SMS_TEMPLATE_CODE", required: false, description: "阿里云 SMS 模板代码" },
  { key: "RESEND_API_KEY", required: false, description: "Resend 邮件 API Key" },
  { key: "ALIPAY_APP_ID", required: false, description: "支付宝 AppID" },
  { key: "WECHAT_MCH_ID", required: false, description: "微信支付商户号" },
  { key: "STRIPE_SECRET_KEY", required: false, description: "Stripe Secret Key" },
  { key: "NEXT_PUBLIC_SITE_URL", required: false, description: "站点公开 URL" },
];

export function validateEnv(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const v of ENV_VARS) {
    const value = process.env[v.key];
    if (!value || value.includes("your_") || value.includes("YOUR_")) {
      if (v.required) {
        errors.push(`[MISSING] ${v.key} — ${v.description}`);
      } else {
        warnings.push(`[OPTIONAL] ${v.key} — ${v.description} (将使用开发模式降级)`);
      }
    }
  }

  // Check JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET || "";
  if (jwtSecret && jwtSecret.length < 32 && process.env.NODE_ENV === "production") {
    errors.push("[WEAK] JWT_SECRET 长度应不少于32位");
  }

  if (errors.length > 0) {
    console.error("\n🚨 环境变量配置错误:");
    errors.forEach((e) => console.error(`  ❌ ${e}`));
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  可选环境变量未配置 (开发模式可忽略):");
    warnings.forEach((w) => console.warn(`  ⚡ ${w}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("✅ 所有环境变量已正确配置");
  }

  return { valid: errors.length === 0, errors, warnings };
}
