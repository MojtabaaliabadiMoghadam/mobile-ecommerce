"use server";
import { db } from "@/db";
import { addresses, orderStatusHistory, orders, products, reviews, users, wishlists } from "@/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { awardPoints } from "@/lib/orders";

export async function toggleWishlist(productId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" as const };
  const [ex] = await db.select().from(wishlists).where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)));
  if (ex) {
    await db.delete(wishlists).where(eq(wishlists.id, ex.id));
    revalidatePath("/account/wishlist");
    return { added: false };
  }
  await db.insert(wishlists).values({ userId: user.id, productId });
  revalidatePath("/account/wishlist");
  return { added: true };
}

export async function submitReview(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "برای ثبت نظر ابتدا وارد شوید" };
  const productId = Number(formData.get("productId"));
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating"))));
  const title = String(formData.get("title") || "").slice(0, 190);
  const body = String(formData.get("body") || "").trim();
  const slug = String(formData.get("slug"));
  if (body.length < 5) return { error: "متن نظر خیلی کوتاه است" };
  await db.insert(reviews).values({ productId, userId: user.id, authorName: user.name, rating, title, body });
  const [agg] = await db.select({ avg: sql<string>`round(avg(${reviews.rating})::numeric, 2)`, c: sql<number>`count(*)::int` }).from(reviews).where(and(eq(reviews.productId, productId), eq(reviews.isApproved, true)));
  await db.update(products).set({ ratingAvg: agg.avg, ratingCount: agg.c }).where(eq(products.id, productId));
  await awardPoints(user.id, 50, "ثبت نظر برای محصول");
  revalidatePath(`/product/${slug}`);
  return { ok: true };
}

export async function saveAddress(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  const id = Number(formData.get("id") || 0);
  const data = {
    userId: user.id,
    title: String(formData.get("title") || "آدرس"),
    receiverName: String(formData.get("receiverName")),
    receiverPhone: String(formData.get("receiverPhone")),
    province: String(formData.get("province")),
    city: String(formData.get("city")),
    postalCode: String(formData.get("postalCode")),
    line: String(formData.get("line")),
    isDefault: formData.get("isDefault") === "on",
  };
  if (!data.receiverName || !data.receiverPhone || !data.city || !data.line) return { error: "لطفاً همه فیلدهای ضروری را پر کنید" };
  if (data.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  if (id) await db.update(addresses).set(data).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  else await db.insert(addresses).values(data);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { ok: true };
}
export async function deleteAddress(id: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  if (name.length < 2) return { error: "نام معتبر نیست" };
  const patch: Partial<typeof users.$inferInsert> = { name, phone: phone || null };
  if (newPassword) {
    const [u] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, user.id));
    if (!verifyPassword(currentPassword, u.h)) return { error: "رمز عبور فعلی اشتباه است" };
    if (newPassword.length < 8) return { error: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد" };
    patch.passwordHash = hashPassword(newPassword);
  }
  await db.update(users).set(patch).where(eq(users.id, user.id));
  revalidatePath("/account");
  return { ok: true };
}

export async function cancelMyOrder(orderId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: "auth" };
  const [o] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, user.id)));
  if (!o || o.status !== "pending_payment") return { error: "فقط سفارش‌های در انتظار پرداخت قابل لغو هستند" };
  await db.update(orders).set({ status: "cancelled", updatedAt: new Date() }).where(eq(orders.id, orderId));
  await db.insert(orderStatusHistory).values({ orderId, status: "cancelled", note: "سفارش توسط مشتری لغو شد" });
  revalidatePath("/account/orders");
  return { ok: true };
}
