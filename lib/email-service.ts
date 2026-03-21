/**
 * Email Service — Resend Integration
 * 
 * Setup:
 * 1. Register at https://resend.com
 * 2. Add and verify your domain
 * 3. Create API key
 * 4. Fill in .env: RESEND_API_KEY
 * 
 * Free tier: 3,000 emails/month
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "noreply@smarttravel.com";
const SITE_NAME = "智游清远 SmartTravel";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; message: string }> {
  // Dev mode: log to console if key not configured
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL-DEV] To: ${to}, Subject: ${subject}`);
    return { success: true, message: "邮件已发送（开发模式）" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${SITE_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`[EMAIL] Sent to ${to}`);
      return { success: true, message: "邮件已发送" };
    } else {
      console.error("[EMAIL] Failed:", data);
      return { success: false, message: `邮件发送失败: ${data.message || "未知错误"}` };
    }
  } catch (error) {
    console.error("[EMAIL] Error:", error);
    return { success: false, message: "邮件服务暂不可用" };
  }
}

export async function sendVerificationEmail(to: string, code: string): Promise<{ success: boolean; message: string }> {
  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;padding:32px">
      <h2 style="color:#059669;margin-bottom:8px">智游清远 SmartTravel</h2>
      <p style="color:#6b7280;margin-bottom:24px">您的验证码：</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#059669">${code}</span>
      </div>
      <p style="color:#9ca3af;font-size:14px">验证码5分钟内有效，请勿泄露给他人。</p>
      <p style="color:#9ca3af;font-size:14px">如非本人操作，请忽略此邮件。</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="color:#d1d5db;font-size:12px;text-align:center">© ${new Date().getFullYear()} 智游清远 SmartTravel</p>
    </div>
  `;
  return sendEmail(to, `[智游清远] 验证码: ${code}`, html);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; message: string }> {
  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;padding:32px">
      <h2 style="color:#059669;margin-bottom:8px">欢迎加入智游清远！🎉</h2>
      <p style="margin-bottom:16px">${name}，您好！</p>
      <p style="color:#6b7280;margin-bottom:24px">感谢您注册智游清远，开始探索清远的美丽乡村吧：</p>
      <ul style="color:#6b7280;padding-left:20px;margin-bottom:24px">
        <li>🏔️ AI智能行程规划 — 30秒定制专属路线</li>
        <li>🗺️ 实景地图导航 — 弯道提前提醒</li>
        <li>🎭 数字人伴游 — 支持粤语/瑶语讲解</li>
        <li>📊 口碑分算法 — 发现小众秘境</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://smarttravel.com"}" 
         style="display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
        开始探索 →
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="color:#d1d5db;font-size:12px;text-align:center">© ${new Date().getFullYear()} 智游清远 SmartTravel</p>
    </div>
  `;
  return sendEmail(to, "欢迎加入智游清远！🎉", html);
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNo: string,
  planName: string,
  amount: number
): Promise<{ success: boolean; message: string }> {
  const html = `
    <div style="max-width:480px;margin:0 auto;font-family:system-ui,sans-serif;padding:32px">
      <h2 style="color:#059669;margin-bottom:8px">订单确认 ✅</h2>
      <p style="color:#6b7280;margin-bottom:24px">您的订阅已成功激活：</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
        <p style="margin:4px 0"><strong>订单号：</strong>${orderNo}</p>
        <p style="margin:4px 0"><strong>方案：</strong>${planName}</p>
        <p style="margin:4px 0"><strong>金额：</strong>¥${amount}</p>
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
      <p style="color:#d1d5db;font-size:12px;text-align:center">© ${new Date().getFullYear()} 智游清远 SmartTravel</p>
    </div>
  `;
  return sendEmail(to, `[智游清远] 订单确认 #${orderNo}`, html);
}
