import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Payment Webhook — Receives payment confirmation callbacks
 * 
 * Each payment provider sends a POST to this endpoint when payment succeeds/fails.
 * Configure this URL in each payment provider's dashboard:
 *   https://yourdomain.com/api/payment/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const source = req.headers.get("x-payment-source") || "unknown";

    console.log(`[Webhook] Received from ${source}:`, body.slice(0, 200));

    let orderNo = "";
    let tradeNo = "";
    let success = false;

    // ── Alipay Callback ──
    if (source === "alipay" || body.includes("trade_status")) {
      const params = new URLSearchParams(body);
      orderNo = params.get("out_trade_no") || "";
      tradeNo = params.get("trade_no") || "";
      const tradeStatus = params.get("trade_status");
      success = tradeStatus === "TRADE_SUCCESS" || tradeStatus === "TRADE_FINISHED";

      // TODO: Verify signature with Alipay public key
      // const isValid = alipaySdk.checkNotifySign(params);
    }

    // ── WeChat Pay Callback ──
    else if (source === "wechat" || req.headers.get("wechatpay-signature")) {
      const data = JSON.parse(body);
      // TODO: Decrypt and verify with WeChat Pay API v3
      // const decrypted = wechatPay.decipher_gcm(data.resource.ciphertext, ...);
      orderNo = data.resource?.out_trade_no || data.out_trade_no || "";
      tradeNo = data.resource?.transaction_id || data.transaction_id || "";
      success = data.resource?.trade_state === "SUCCESS" || data.trade_state === "SUCCESS";
    }

    // ── Stripe Webhook ──
    else if (source === "stripe" || req.headers.get("stripe-signature")) {
      const data = JSON.parse(body);
      // TODO: Verify with Stripe webhook secret
      // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      if (data.type === "checkout.session.completed") {
        orderNo = data.data?.object?.metadata?.orderNo || "";
        tradeNo = data.data?.object?.payment_intent || "";
        success = true;
      }
    }

    if (!orderNo) {
      console.warn("[Webhook] No orderNo found");
      return NextResponse.json({ success: false, message: "Invalid callback" }, { status: 400 });
    }

    // Update order in database
    const order = await prisma?.order.findUnique({ where: { orderNo } });
    if (!order) {
      console.warn(`[Webhook] Order not found: ${orderNo}`);
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      // Already processed — return success to prevent retry
      return new Response("success", { status: 200 });
    }

    await prisma?.order.update({
      where: { orderNo },
      data: {
        status: success ? "PAID" : "FAILED",
        tradeNo: tradeNo || undefined,
        paidAt: success ? new Date() : undefined,
        expiresAt: success
          ? new Date(Date.now() + (order.billing === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000)
          : undefined,
      },
    });

    console.log(`[Webhook] Order ${orderNo} → ${success ? "PAID" : "FAILED"}`);

    // Alipay expects "success" text response
    // WeChat expects { code: "SUCCESS" }
    if (source === "wechat") {
      return NextResponse.json({ code: "SUCCESS", message: "OK" });
    }
    return new Response("success", { status: 200 });
  } catch (error) {
    console.error("[Webhook Error]", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
