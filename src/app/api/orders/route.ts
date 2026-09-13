import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/data";
import { createOrder, type CheckoutPayload } from "@/lib/orders";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ orders: await getUserOrders(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "برای ثبت سفارش وارد شوید" }, { status: 401 });
  const payload = (await req.json().catch(() => null)) as CheckoutPayload | null;
  if (!payload?.items?.length) return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });
  if (!payload.address?.receiverName || !payload.address?.receiverPhone) return NextResponse.json({ error: "آدرس تحویل را انتخاب کنید" }, { status: 400 });
  try {
    const order = await createOrder(user.id, user.loyaltyTier, payload);
    const next = order.paymentMethod === "zarinpal" ? `/api/payment/zarinpal/request?order=${order.orderNumber}` : `/order/${order.orderNumber}?status=success`;
    return NextResponse.json({ ok: true, orderNumber: order.orderNumber, redirect: next });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "خطا در ثبت سفارش" }, { status: 400 });
  }
}
