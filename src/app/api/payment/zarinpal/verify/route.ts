import { db } from "@/db";
import { orders } from "@/db/schema";
import { confirmOrder, failPayment } from "@/lib/orders";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/** شبیه‌سازی Callback زرین‌پال: ?Authority=...&Status=OK|NOK */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority") ?? "";
  const status = url.searchParams.get("Status") ?? "NOK";
  const [o] = await db.select().from(orders).where(eq(orders.paymentAuthority, authority));
  if (!o) return NextResponse.redirect(new URL("/cart?error=payment", url.origin));
  if (status === "OK") {
    // در حالت واقعی: POST به /pg/v4/payment/verify.json و دریافت ref_id
    const refId = `${Math.floor(100000000 + Math.random() * 900000000)}`;
    await confirmOrder(o.id, refId);
    return NextResponse.redirect(new URL(`/order/${o.orderNumber}?status=success`, url.origin));
  }
  await failPayment(o.id);
  return NextResponse.redirect(new URL(`/order/${o.orderNumber}?status=failed`, url.origin));
}
