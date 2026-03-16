/**
 * SMS Service — Aliyun SMS Integration
 * 
 * Setup:
 * 1. Register at https://www.aliyun.com
 * 2. Enable SMS service: https://dysms.console.aliyun.com
 * 3. Create signature (签名) and template (模板)
 * 4. Get AccessKey from https://ram.console.aliyun.com
 * 5. Fill in .env: ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_SMS_SIGN_NAME, ALIYUN_SMS_TEMPLATE_CODE
 * 
 * Cost: ~¥0.045/message
 */

import crypto from "crypto";

const ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID || "";
const ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET || "";
const SIGN_NAME = process.env.ALIYUN_SMS_SIGN_NAME || "智游清远";
const TEMPLATE_CODE = process.env.ALIYUN_SMS_TEMPLATE_CODE || "";

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");
}

function generateSignature(params: Record<string, string>, secret: string): string {
  const sortedKeys = Object.keys(params).sort();
  const canonicalized = sortedKeys.map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&");
  const stringToSign = `GET&${percentEncode("/")}&${percentEncode(canonicalized)}`;
  const hmac = crypto.createHmac("sha1", `${secret}&`);
  hmac.update(stringToSign);
  return hmac.digest("base64");
}

export async function sendSms(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  // Dev mode: log to console if keys not configured
  if (!ACCESS_KEY_ID || !ACCESS_KEY_SECRET || !TEMPLATE_CODE) {
    console.log(`[SMS-DEV] Code ${code} → ${phone}`);
    return { success: true, message: "验证码已发送（开发模式）" };
  }

  try {
    const params: Record<string, string> = {
      AccessKeyId: ACCESS_KEY_ID,
      Action: "SendSms",
      Format: "JSON",
      PhoneNumbers: phone,
      RegionId: "cn-hangzhou",
      SignName: SIGN_NAME,
      SignatureMethod: "HMAC-SHA1",
      SignatureNonce: crypto.randomUUID(),
      SignatureVersion: "1.0",
      TemplateCode: TEMPLATE_CODE,
      TemplateParam: JSON.stringify({ code }),
      Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      Version: "2017-05-25",
    };

    params.Signature = generateSignature(params, ACCESS_KEY_SECRET);

    const queryString = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const response = await fetch(`https://dysmsapi.aliyuncs.com/?${queryString}`);
    const data = await response.json();

    if (data.Code === "OK") {
      console.log(`[SMS] Sent to ${phone}`);
      return { success: true, message: "验证码已发送" };
    } else {
      console.error(`[SMS] Failed:`, data);
      return { success: false, message: `短信发送失败: ${data.Message || "未知错误"}` };
    }
  } catch (error) {
    console.error("[SMS] Error:", error);
    return { success: false, message: "短信服务暂不可用" };
  }
}
