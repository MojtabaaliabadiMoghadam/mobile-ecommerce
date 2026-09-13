"use server";
import { db } from "@/db";
import { banners, coupons, loyaltyTransactions, pages, paymentGateways, productImages, productVariants, products, reviews, settings, users, articles, articleCategories, media, type OrderStatus } from "@/db/schema";
import { getCurrentUser, hasPermission, hashPassword } from "@/lib/auth";
import { changeOrderStatus } from "@/lib/orders";
import { slugify, tierForPoints } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function guard(perm: string) {
  const user = await getCurrentUser();
  if (!hasPermission(user, perm)) throw new Error("دسترسی غیرمجاز");
  return user!;
}
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const n = (fd: FormData, k: string) => Number(fd.get(k) ?? 0) || 0;
const b = (fd: FormData, k: string) => fd.get(k) === "on";

// ---------- Products ----------
export type VariantInput = { id?: number; color: string; colorHex: string; storage: string; ram: string; price: number; stock: number };
export async function saveProduct(fd: FormData) {
  try {
    await guard("products");
    const id = n(fd, "id");
    const name = s(fd, "name");
    if (!name) return { error: "نام محصول الزامی است" };
    const slug = s(fd, "slug") || slugify(name);
    const specsRaw = s(fd, "specs");
    const specs: Record<string, string> = {};
    specsRaw.split("\n").forEach((line) => {
      const [k, ...v] = line.split(":");
      if (k && v.length) specs[k.trim()] = v.join(":").trim();
    });
    const discountPercent = n(fd, "discountPercent");
    const compareAt = n(fd, "compareAtPrice") || null;
    const data = {
      name,
      slug,
      sku: s(fd, "sku") || null,
      brandId: n(fd, "brandId") || null,
      categoryId: n(fd, "categoryId") || null,
      shortDescription: s(fd, "shortDescription") || null,
      description: s(fd, "description") || null,
      basePrice: n(fd, "basePrice"),
      compareAtPrice: compareAt,
      discountPercent,
      specs,
      isFeatured: b(fd, "isFeatured"),
      isActive: b(fd, "isActive"),
      metaTitle: s(fd, "metaTitle") || null,
      metaDescription: s(fd, "metaDescription") || null,
      updatedAt: new Date(),
    };
    let productId = id;
    if (id) await db.update(products).set(data).where(eq(products.id, id));
    else {
      const [p] = await db.insert(products).values(data).returning();
      productId = p.id;
    }
    // images
    const images = s(fd, "images").split("\n").map((l) => l.trim()).filter(Boolean);
    await db.delete(productImages).where(eq(productImages.productId, productId));
    if (images.length) await db.insert(productImages).values(images.map((line, i) => { const [url, alt] = line.split("|"); return { productId, url: url.trim(), alt: (alt ?? name).trim(), sortOrder: i }; }));
    // variants
    const variants = JSON.parse(s(fd, "variants") || "[]") as VariantInput[];
    const keep: number[] = [];
    for (const v of variants) {
      if (!v.color || !v.storage || !v.ram) continue;
      const row = { productId, color: v.color, colorHex: v.colorHex || "#000000", storage: v.storage, ram: v.ram, price: Number(v.price) || data.basePrice, stock: Number(v.stock) || 0 };
      if (v.id) { await db.update(productVariants).set(row).where(eq(productVariants.id, v.id)); keep.push(v.id); }
      else { const [nv] = await db.insert(productVariants).values(row).returning(); keep.push(nv.id); }
    }
    const existing = await db.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.productId, productId));
    for (const e of existing) if (!keep.includes(e.id)) await db.delete(productVariants).where(eq(productVariants.id, e.id));
    revalidatePath("/"); revalidatePath("/products"); revalidatePath(`/product/${slug}`); revalidatePath("/admin/products");
    return { ok: true, id: productId };
  } catch (e) {
    return { error: e instanceof Error ? (e.message.includes("unique") ? "این slug قبلاً استفاده شده" : e.message) : "خطا" };
  }
}
export async function deleteProduct(id: number) {
  await guard("products");
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products"); revalidatePath("/"); revalidatePath("/products");
  return { ok: true };
}
export async function toggleProductFlag(id: number, field: "isActive" | "isFeatured", value: boolean) {
  await guard("products");
  await db.update(products).set({ [field]: value }).where(eq(products.id, id));
  revalidatePath("/admin/products"); revalidatePath("/");
  return { ok: true };
}
export async function toggleReview(id: number, approved: boolean) {
  await guard("products");
  const [r] = await db.update(reviews).set({ isApproved: approved }).where(eq(reviews.id, id)).returning();
  const [agg] = await db.select({ avg: sql<string>`coalesce(round(avg(${reviews.rating})::numeric,2),0)`, c: sql<number>`count(*)::int` }).from(reviews).where(sql`${reviews.productId} = ${r.productId} and ${reviews.isApproved} = true`);
  await db.update(products).set({ ratingAvg: agg.avg, ratingCount: agg.c }).where(eq(products.id, r.productId));
  revalidatePath("/admin/reviews");
  return { ok: true };
}
export async function deleteReview(id: number) {
  await guard("products");
  await db.delete(reviews).where(eq(reviews.id, id));
  revalidatePath("/admin/reviews");
  return { ok: true };
}

// ---------- Orders ----------
export async function updateOrderStatus(fd: FormData) {
  try {
    await guard("orders");
    const id = n(fd, "id");
    await changeOrderStatus(id, s(fd, "status") as OrderStatus, s(fd, "note") || undefined, s(fd, "trackingCode") || undefined);
    revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/orders"); revalidatePath("/account/orders");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "خطا" };
  }
}

// ---------- Users ----------
export async function saveUser(fd: FormData) {
  try {
    const me = await guard("users");
    const id = n(fd, "id");
    const role = s(fd, "role") as "customer" | "admin" | "manager" | "support";
    if (role === "admin" && me.role !== "admin") return { error: "فقط مدیر کل می‌تواند مدیر کل تعریف کند" };
    const permissions = fd.getAll("permissions").map(String);
    const points = n(fd, "loyaltyPoints");
    const data: Partial<typeof users.$inferInsert> = { name: s(fd, "name"), email: s(fd, "email").toLowerCase(), phone: s(fd, "phone") || null, role, permissions, isActive: b(fd, "isActive"), loyaltyPoints: points, loyaltyTier: tierForPoints(points), personalCoupon: s(fd, "personalCoupon") || null };
    const pw = s(fd, "password");
    if (pw) data.passwordHash = hashPassword(pw);
    if (id) {
      const [old] = await db.select({ p: users.loyaltyPoints }).from(users).where(eq(users.id, id));
      await db.update(users).set(data).where(eq(users.id, id));
      if (old && old.p !== points) await db.insert(loyaltyTransactions).values({ userId: id, points: points - old.p, reason: "تعدیل امتیاز توسط مدیر" });
    } else {
      if (!pw) return { error: "رمز عبور برای کاربر جدید الزامی است" };
      await db.insert(users).values({ ...data, name: data.name!, email: data.email!, passwordHash: hashPassword(pw) });
    }
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? (e.message.includes("unique") ? "ایمیل تکراری است" : e.message) : "خطا" };
  }
}
export async function deleteUser(id: number) {
  const me = await guard("users");
  if (me.id === id) return { error: "نمی‌توانید خودتان را حذف کنید" };
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
  return { ok: true };
}

// ---------- Coupons ----------
export async function saveCoupon(fd: FormData) {
  try {
    await guard("coupons");
    const id = n(fd, "id");
    const exp = s(fd, "expiresAt");
    const data = { code: s(fd, "code").toUpperCase(), type: s(fd, "type") as "percent" | "fixed", value: n(fd, "value"), minOrder: n(fd, "minOrder"), maxDiscount: n(fd, "maxDiscount") || null, usageLimit: n(fd, "usageLimit") || null, userId: n(fd, "userId") || null, isActive: b(fd, "isActive"), expiresAt: exp ? new Date(exp) : null };
    if (!data.code || !data.value) return { error: "کد و مقدار الزامی است" };
    if (id) await db.update(coupons).set(data).where(eq(coupons.id, id));
    else await db.insert(coupons).values(data);
    revalidatePath("/admin/coupons");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? (e.message.includes("unique") ? "این کد قبلاً ثبت شده" : e.message) : "خطا" };
  }
}
export async function deleteCoupon(id: number) {
  await guard("coupons");
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
  return { ok: true };
}

// ---------- Content ----------
export async function saveBanner(fd: FormData) {
  await guard("content");
  const id = n(fd, "id");
  const data = { title: s(fd, "title"), subtitle: s(fd, "subtitle") || null, image: s(fd, "image"), link: s(fd, "link") || null, position: s(fd, "position") || "hero", isActive: b(fd, "isActive"), sortOrder: n(fd, "sortOrder") };
  if (!data.title || !data.image) return { error: "عنوان و تصویر الزامی است" };
  if (id) await db.update(banners).set(data).where(eq(banners.id, id));
  else await db.insert(banners).values(data);
  revalidatePath("/"); revalidatePath("/admin/banners");
  return { ok: true };
}
export async function deleteBanner(id: number) {
  await guard("content");
  await db.delete(banners).where(eq(banners.id, id));
  revalidatePath("/"); revalidatePath("/admin/banners");
  return { ok: true };
}
export async function savePage(fd: FormData) {
  try {
    await guard("content");
    const id = n(fd, "id");
    const data = { title: s(fd, "title"), slug: s(fd, "slug") || slugify(s(fd, "title")), content: s(fd, "content"), metaTitle: s(fd, "metaTitle") || null, metaDescription: s(fd, "metaDescription") || null, isPublished: b(fd, "isPublished"), updatedAt: new Date() };
    if (!data.title) return { error: "عنوان الزامی است" };
    if (id) await db.update(pages).set(data).where(eq(pages.id, id));
    else await db.insert(pages).values(data);
    revalidatePath(`/p/${data.slug}`); revalidatePath("/admin/pages");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "خطا" };
  }
}
export async function deletePage(id: number) {
  await guard("content");
  await db.delete(pages).where(eq(pages.id, id));
  revalidatePath("/admin/pages");
  return { ok: true };
}
export async function saveSettings(fd: FormData) {
  await guard("settings");
  for (const [k, v] of fd.entries()) {
    if (k.startsWith("$")) continue;
    await db.insert(settings).values({ key: k, value: String(v) }).onConflictDoUpdate({ target: settings.key, set: { value: String(v) } });
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
export async function saveGateway(fd: FormData) {
  await guard("payments");
  const id = n(fd, "id");
  let config: Record<string, string> = {};
  try { config = JSON.parse(s(fd, "config") || "{}"); } catch { return { error: "تنظیمات JSON نامعتبر است" }; }
  await db.update(paymentGateways).set({ name: s(fd, "name"), description: s(fd, "description") || null, isActive: b(fd, "isActive"), sortOrder: n(fd, "sortOrder"), config }).where(eq(paymentGateways.id, id));
  revalidatePath("/admin/gateways"); revalidatePath("/checkout");
  return { ok: true };
}

// ---------- Articles ----------
export async function saveArticle(fd: FormData) {
  try {
    await guard("content");
    const id = n(fd, "id");
    const title = s(fd, "title");
    if (!title) return { error: "عنوان مقاله الزامی است" };
    const isPublishedNew = b(fd, "isPublished");
    const data = {
      title,
      slug: s(fd, "slug") || slugify(title),
      excerpt: s(fd, "excerpt") || null,
      content: s(fd, "content"),
      coverImage: s(fd, "coverImage") || null,
      categoryId: n(fd, "categoryId") || null,
      authorName: s(fd, "authorName") || "مدیر سایت",
      tags: s(fd, "tags").split(",").map((t) => t.trim()).filter(Boolean),
      isPublished: isPublishedNew,
      metaTitle: s(fd, "metaTitle") || null,
      metaDescription: s(fd, "metaDescription") || null,
      publishedAt: isPublishedNew ? (s(fd, "publishedAt") ? new Date(s(fd, "publishedAt")) : new Date()) : null,
      updatedAt: new Date(),
    };
    if (!data.content) return { error: "متن مقاله الزامی است" };
    if (id) await db.update(articles).set(data).where(eq(articles.id, id));
    else await db.insert(articles).values(data);
    revalidatePath("/blog"); revalidatePath(`/blog/${data.slug}`); revalidatePath("/admin/articles");
    return { ok: true, slug: data.slug };
  } catch (e) {
    return { error: e instanceof Error ? (e.message.includes("unique") ? "این slug قبلاً استفاده شده" : e.message) : "خطا" };
  }
}
export async function deleteArticle(id: number) {
  await guard("content");
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/blog"); revalidatePath("/admin/articles");
  return { ok: true };
}
export async function saveArticleCategory(fd: FormData) {
  try {
    await guard("content");
    const id = n(fd, "id");
    const name = s(fd, "name");
    if (!name) return { error: "نام دسته الزامی است" };
    const data = { name, slug: s(fd, "slug") || slugify(name), sortOrder: n(fd, "sortOrder") };
    if (id) await db.update(articleCategories).set(data).where(eq(articleCategories.id, id));
    else await db.insert(articleCategories).values(data);
    revalidatePath("/admin/articles");
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? (e.message.includes("unique") ? "این slug قبلاً استفاده شده" : e.message) : "خطا" };
  }
}
export async function deleteArticleCategory(id: number) {
  await guard("content");
  await db.delete(articleCategories).where(eq(articleCategories.id, id));
  revalidatePath("/admin/articles");
  return { ok: true };
}

// ---------- Media ----------
export async function deleteMedia(id: number) {
  await guard("content");
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return { error: "فایل یافت نشد" };
  if (row.url.startsWith("/uploads/")) {
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public", row.url));
    } catch {}
  }
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
  return { ok: true };
}
export async function updateMediaAlt(fd: FormData) {
  await guard("content");
  const id = n(fd, "id");
  const alt = s(fd, "alt");
  await db.update(media).set({ alt: alt || null }).where(eq(media.id, id));
  revalidatePath("/admin/media");
  return { ok: true };
}
