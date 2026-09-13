import { db } from "@/db";
import { coupons, loyaltyTransactions, orderItems, orderStatusHistory, orders, productVariants, products, users, type OrderStatus } from "@/db/schema";
import { and, eq, isNull, or, sql } from "drizzle-orm";
import { genOrderNumber, SHIPPING_METHOD, TIERS, tierForPoints } from "./utils";
import { getVariantsByIds } from "./data";

export async function validateCoupon(code: string, subtotal: number, userId: number | null) {
  const [c] = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.isActive, true), or(isNull(coupons.userId), userId ? eq(coupons.userId, userId) : sql`false`)));
  if (!c) return { ok: false as const, message: "کد تخفیف معتبر نیست" };
  if (c.expiresAt && c.expiresAt < new Date()) return { ok: false as const, message: "کد تخفیف منقضی شده است" };
  if (c.usageLimit && c.usedCount >= c.usageLimit) return { ok: false as const, message: "ظرفیت استفاده از این کد تمام شده" };
  if (subtotal < c.minOrder) return { ok: false as const, message: `حداقل مبلغ سفارش برای این کد ${new Intl.NumberFormat("fa-IR").format(c.minOrder)} تومان است` };
  let discount = c.type === "percent" ? Math.floor((subtotal * c.value) / 100) : c.value;
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true as const, discount, coupon: c };
}

export type CheckoutPayload = {
  items: { variantId: number; qty: number }[];
  address: { receiverName: string; receiverPhone: string; province: string; city: string; postalCode: string; line: string };
  shippingMethod: "post" | "express" | "pickup";
  paymentMethod: "zarinpal" | "cod" | "in_store";
  couponCode?: string;
  note?: string;
};

export async function createOrder(userId: number, tier: keyof typeof TIERS, payload: CheckoutPayload) {
  const variants = await getVariantsByIds(payload.items.map((i) => i.variantId));
  if (!variants.length) throw new Error("سبد خرید خالی است");
  const lines = payload.items.map((i) => {
    const v = variants.find((x) => x.id === i.variantId);
    if (!v) throw new Error("یکی از محصولات یافت نشد");
    if (v.stock < i.qty) throw new Error(`موجودی «${v.productName} - ${v.color} ${v.storage}» کافی نیست`);
    return { v, qty: i.qty };
  });
  const subtotal = lines.reduce((a, l) => a + l.v.price * l.qty, 0);
  let discount = 0;
  let couponCode: string | null = null;
  if (payload.couponCode) {
    const r = await validateCoupon(payload.couponCode, subtotal, userId);
    if (!r.ok) throw new Error(r.message);
    discount = r.discount;
    couponCode = r.coupon.code;
  } else if (TIERS[tier].discount > 0) {
    discount = Math.floor((subtotal * TIERS[tier].discount) / 100);
    couponCode = `TIER-${tier.toUpperCase()}`;
  }
  const freeThreshold = 30000000;
  const shippingCost = payload.shippingMethod === "pickup" ? 0 : subtotal >= freeThreshold ? 0 : SHIPPING_METHOD[payload.shippingMethod].cost;
  const total = subtotal - discount + shippingCost;
  const paymentMethod = payload.shippingMethod === "pickup" && payload.paymentMethod === "cod" ? "in_store" : payload.paymentMethod;

  const [o] = await db
    .insert(orders)
    .values({
      orderNumber: genOrderNumber(),
      userId,
      status: "pending_payment",
      paymentStatus: "unpaid",
      paymentMethod,
      shippingMethod: payload.shippingMethod,
      subtotal,
      discount,
      shippingCost,
      total,
      couponCode,
      shippingAddress: payload.address,
      note: payload.note || null,
      paymentAuthority: paymentMethod === "zarinpal" ? `A${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 8).toUpperCase()}` : null,
    })
    .returning();
  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: o.id,
      productId: l.v.productId,
      variantId: l.v.id,
      productName: l.v.productName,
      variantLabel: `${l.v.color} / ${l.v.storage} / رم ${l.v.ram}`,
      image: l.v.image,
      unitPrice: l.v.price,
      quantity: l.qty,
    }))
  );
  await db.insert(orderStatusHistory).values({ orderId: o.id, status: "pending_payment", note: "سفارش ثبت شد" });
  if (couponCode && !couponCode.startsWith("TIER-")) {
    await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, couponCode));
  }
  // COD / in-store: reserve stock and move to processing immediately
  if (paymentMethod !== "zarinpal") {
    await confirmOrder(o.id, null, paymentMethod === "in_store" ? "سفارش ثبت شد؛ پرداخت هنگام تحویل حضوری" : "سفارش ثبت شد؛ پرداخت در محل");
  }
  return o;
}

/** Decrement stock, bump sales, award points, move to processing. */
export async function confirmOrder(orderId: number, paymentRef: string | null, note = "پرداخت تأیید و سفارش در حال پردازش است") {
  const o = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
  if (!o || o.status !== "pending_payment") return o;
  for (const it of o.items) {
    if (it.variantId) await db.update(productVariants).set({ stock: sql`greatest(${productVariants.stock} - ${it.quantity}, 0)` }).where(eq(productVariants.id, it.variantId));
    if (it.productId) await db.update(products).set({ salesCount: sql`${products.salesCount} + ${it.quantity}` }).where(eq(products.id, it.productId));
  }
  const isPaidNow = paymentRef !== null;
  const points = Math.floor(o.total / 100000);
  await db
    .update(orders)
    .set({ status: "processing", paymentStatus: isPaidNow ? "paid" : "unpaid", paymentRef, pointsEarned: points, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  await db.insert(orderStatusHistory).values({ orderId, status: "processing", note });
  if (isPaidNow && o.userId) await awardPoints(o.userId, points, `امتیاز خرید سفارش ${o.orderNumber}`, orderId);
  return o;
}

export async function awardPoints(userId: number, points: number, reason: string, orderId?: number) {
  if (points <= 0) return;
  const [u] = await db.select({ p: users.loyaltyPoints, tier: users.loyaltyTier, name: users.name, coupon: users.personalCoupon }).from(users).where(eq(users.id, userId));
  if (!u) return;
  const [uu] = await db.select({ multiplier: users.loyaltyTier }).from(users).where(eq(users.id, userId));
  const mult = TIERS[uu.multiplier].multiplier;
  const earned = Math.round(points * mult);
  const newPoints = u.p + earned;
  const newTier = tierForPoints(newPoints);
  await db.insert(loyaltyTransactions).values({ userId, points: earned, reason, orderId });
  const patch: Partial<typeof users.$inferInsert> = { loyaltyPoints: newPoints, loyaltyTier: newTier };
  if (newTier !== u.tier && newTier !== "bronze" && !u.coupon) {
    const code = `${newTier.toUpperCase()}-${userId}-${Math.floor(100 + Math.random() * 900)}`;
    patch.personalCoupon = code;
    await db.insert(coupons).values({ code, type: "percent", value: TIERS[newTier].discount + 3, maxDiscount: 5000000, userId });
    await db.insert(loyaltyTransactions).values({ userId, points: 0, reason: `ارتقا به سطح ${TIERS[newTier].label} — کد تخفیف اختصاصی ${code} صادر شد` });
  }
  await db.update(users).set(patch).where(eq(users.id, userId));
}

export async function failPayment(orderId: number) {
  await db.update(orders).set({ paymentStatus: "failed", updatedAt: new Date() }).where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment")));
}

export async function changeOrderStatus(orderId: number, status: OrderStatus, note?: string, trackingCode?: string) {
  const o = await db.query.orders.findFirst({ where: eq(orders.id, orderId), with: { items: true } });
  if (!o) throw new Error("سفارش یافت نشد");
  if (o.status === status) return;
  if (status === "processing" && o.status === "pending_payment") {
    await confirmOrder(orderId, o.paymentMethod === "zarinpal" ? "MANUAL" : null, note || "تأیید دستی توسط مدیر");
    return;
  }
  if (status === "cancelled" && o.status !== "pending_payment") {
    // restore stock
    for (const it of o.items) {
      if (it.variantId) await db.update(productVariants).set({ stock: sql`${productVariants.stock} + ${it.quantity}` }).where(eq(productVariants.id, it.variantId));
    }
  }
  const patch: Partial<typeof orders.$inferInsert> = { status, updatedAt: new Date() };
  if (trackingCode) patch.trackingCode = trackingCode;
  if (status === "delivered" && o.paymentStatus !== "paid") {
    patch.paymentStatus = "paid";
    if (o.userId) await awardPoints(o.userId, Math.floor(o.total / 100000), `امتیاز خرید سفارش ${o.orderNumber}`, orderId);
  }
  if (status === "cancelled" && o.paymentStatus === "paid") patch.paymentStatus = "refunded";
  await db.update(orders).set(patch).where(eq(orders.id, orderId));
  await db.insert(orderStatusHistory).values({ orderId, status, note: note || null });
}
