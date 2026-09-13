import { db } from "@/db";
import { orders, paymentGateways } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * شبیه‌سازی مرحله PaymentRequest زرین‌پال.
 * در حالت واقعی، این‌جا درخواست به https://api.zarinpal.com/pg/v4/payment/request.json ارسال شده
 * و کاربر به https://www.zarinpal.com/pg/StartPay/{Authority} هدایت می‌شود.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderNumber = url.searchParams.get("order") ?? "";
  const [o] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!o) return NextResponse.redirect(new URL("/cart?error=order", url.origin));
  const [gw] = await db.select().from(paymentGateways).where(eq(paymentGateways.key, "zarinpal"));
  if (!gw?.isActive) return NextResponse.redirect(new URL(`/order/${orderNumber}?status=gateway_off`, url.origin));
  // sandbox mode -> internal mock gateway page
  return NextResponse.redirect(new URL(`/payment/zarinpal/${o.paymentAuthority}`, url.origin));
}
