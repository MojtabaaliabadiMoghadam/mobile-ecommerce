import { getCurrentUser } from "@/lib/auth";
import { validateCoupon } from "@/lib/orders";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { code, subtotal } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ ok: false, message: "کد را وارد کنید" }, { status: 400 });
  const r = await validateCoupon(String(code), Number(subtotal) || 0, user?.id ?? null);
  if (!r.ok) return NextResponse.json({ ok: false, message: r.message }, { status: 400 });
  return NextResponse.json({ ok: true, discount: r.discount, code: r.coupon.code });
}
