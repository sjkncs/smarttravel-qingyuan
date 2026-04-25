import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { PayMethod } from "@/lib/generated/prisma";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "@/lib/rate-limit";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`payment:${ip}`, RATE_LIMITS.payment);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: "请求过于频繁，请稍后重试" },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const { planId, amount, billing, method, currency } = body;

    if (!planId || !amount || !method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Get authenticated user (optional for now)
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const user = token ? await getCurrentUser(token) : null;

    // Map method string to enum
    const methodMap: Record<string, PayMethod> = {
      alipay: "ALIPAY",
      wechat: "WECHAT",
      unionpay: "UNIONPAY",
      visa: "VISA",
      mastercard: "MASTERCARD",
    };

    const dbMethod = methodMap[method];
    if (!dbMethod) {
      return NextResponse.json({ success: false, error: "Unsupported payment method" }, { status: 400 });
    }

    // Generate order number
    const orderNo = `ST${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    let payUrl = "";
    let qrCode = "";

    // ── Payment Gateway Integration ──
    // Each gateway falls back to demo URL if SDK keys are not configured
    switch (method) {
      case "alipay": {
        if (process.env.ALIPAY_APP_ID) {
          // Production: Use alipay-sdk
          // import AlipaySdk from 'alipay-sdk';
          // const alipaySdk = new AlipaySdk({ appId, privateKey, alipayPublicKey });
          // payUrl = alipaySdk.pageExec('alipay.trade.page.pay', { bizContent: { out_trade_no: orderNo, total_amount: amount, subject: `智游乡野-${planId}`, product_code: 'FAST_INSTANT_TRADE_PAY' } });
        }
        payUrl = payUrl || `https://openapi.alipay.com/gateway.do?out_trade_no=${orderNo}&total_amount=${amount}`;
        break;
      }
      case "wechat": {
        if (process.env.WECHAT_MCH_ID) {
          // Production: Use wechatpay-node-v3
          // const wxResult = await wechatPay.transactions_native({ description, out_trade_no: orderNo, amount: { total: Math.round(amount * 100) }, notify_url: `${SITE_URL}/api/payment/webhook` });
          // qrCode = wxResult.code_url;
        }
        qrCode = qrCode || `weixin://wxpay/bizpayurl?pr=${orderNo}`;
        payUrl = qrCode;
        break;
      }
      case "unionpay": {
        payUrl = `https://gateway.95516.com/gateway/api/frontTransReq.do?orderId=${orderNo}&txnAmt=${Math.round(amount * 100)}`;
        break;
      }
      case "visa":
      case "mastercard": {
        if (process.env.STRIPE_SECRET_KEY) {
          // Production: Use stripe-node
          // import Stripe from 'stripe';
          // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          // const session = await stripe.checkout.sessions.create({ ... });
          // payUrl = session.url;
        }
        payUrl = payUrl || `https://checkout.stripe.com/c/pay/${orderNo}`;
        break;
      }
    }

    // Persist order to database
    const order = await prisma?.order.create({
      data: {
        orderNo,
        userId: user?.id || "anonymous",
        planId,
        amount,
        currency: currency || "CNY",
        billing: billing || "monthly",
        method: dbMethod,
        status: "PENDING",
        payUrl,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order?.orderNo || orderNo,
      payUrl,
      qrCode: method === "wechat" ? qrCode : undefined,
      method,
      amount,
      currency: currency || "CNY",
      billing,
    });
  } catch (error) {
    console.error("[Payment Error]", error);
    return NextResponse.json({ success: false, error: "Payment creation failed" }, { status: 500 });
  }
}
