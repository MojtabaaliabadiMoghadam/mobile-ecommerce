import { db } from "@/db";
import {
  products,
  productImages,
  productVariants,
  brands,
  categories,
  reviews,
  banners,
  settings,
  orders,
  orderItems,
  orderStatusHistory,
  users,
  wishlists,
  addresses,
  loyaltyTransactions,
  coupons,
  pages,
  paymentGateways,
  articles,
  articleCategories,
  media,
} from "@/db/schema";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql, exists, ne, count } from "drizzle-orm";
import { cache } from "react";
import { ensureSeeded } from "./seed";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  discountPercent: number;
  ratingAvg: string;
  ratingCount: number;
  salesCount: number;
  isFeatured: boolean;
  brandName: string | null;
  image: string | null;
  imageAlt: string | null;
  inStock: boolean;
  createdAt: Date;
};

const firstImage = db
  .select({ url: productImages.url })
  .from(productImages)
  .where(eq(productImages.productId, products.id))
  .orderBy(asc(productImages.sortOrder))
  .limit(1);
const firstImageAlt = db
  .select({ alt: productImages.alt })
  .from(productImages)
  .where(eq(productImages.productId, products.id))
  .orderBy(asc(productImages.sortOrder))
  .limit(1);
const stockSum = db
  .select({ s: sql<number>`coalesce(sum(${productVariants.stock}),0)` })
  .from(productVariants)
  .where(eq(productVariants.productId, products.id));

const cardSelect = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  basePrice: products.basePrice,
  compareAtPrice: products.compareAtPrice,
  discountPercent: products.discountPercent,
  ratingAvg: products.ratingAvg,
  ratingCount: products.ratingCount,
  salesCount: products.salesCount,
  isFeatured: products.isFeatured,
  brandName: brands.name,
  image: sql<string | null>`(${firstImage})`,
  imageAlt: sql<string | null>`(${firstImageAlt})`,
  inStock: sql<boolean>`(${stockSum}) > 0`,
  createdAt: products.createdAt,
};

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  await ensureSeeded();
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export const getCategories = cache(async () => {
  await ensureSeeded();
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
});
export const getBrands = cache(async () => {
  await ensureSeeded();
  return db.select().from(brands).orderBy(asc(brands.name));
});

export async function getBanners(position?: string) {
  await ensureSeeded();
  const where = position ? and(eq(banners.isActive, true), eq(banners.position, position)) : eq(banners.isActive, true);
  return db.select().from(banners).where(where).orderBy(asc(banners.sortOrder));
}

export async function getHomeData() {
  await ensureSeeded();
  const base = db.select(cardSelect).from(products).leftJoin(brands, eq(products.brandId, brands.id)).where(eq(products.isActive, true));
  const [featured, bestsellers, newest, discounted] = await Promise.all([
    base.$dynamic().where(and(eq(products.isActive, true), eq(products.isFeatured, true))).orderBy(desc(products.salesCount)).limit(8),
    base.$dynamic().orderBy(desc(products.salesCount)).limit(8),
    base.$dynamic().orderBy(desc(products.createdAt)).limit(8),
    base.$dynamic().where(and(eq(products.isActive, true), sql`${products.discountPercent} > 0`)).orderBy(desc(products.discountPercent)).limit(8),
  ]);
  return { featured, bestsellers, newest, discounted };
}

export type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string[];
  color?: string[];
  storage?: string[];
  ram?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: "newest" | "cheapest" | "expensive" | "bestselling" | "rating" | "discount";
  page?: number;
  perPage?: number;
};

export async function getProducts(f: ProductFilters) {
  await ensureSeeded();
  const conds = [eq(products.isActive, true)];
  if (f.q) {
    const q = `%${f.q}%`;
    conds.push(or(ilike(products.name, q), ilike(products.slug, q), ilike(products.shortDescription, q))!);
  }
  if (f.category) {
    const cat = db.select({ id: categories.id }).from(categories).where(eq(categories.slug, f.category));
    conds.push(inArray(products.categoryId, cat));
  }
  if (f.brand?.length) {
    const b = db.select({ id: brands.id }).from(brands).where(inArray(brands.slug, f.brand));
    conds.push(inArray(products.brandId, b));
  }
  if (f.minPrice) conds.push(gte(products.basePrice, f.minPrice));
  if (f.maxPrice) conds.push(lte(products.basePrice, f.maxPrice));
  const vConds = [eq(productVariants.productId, products.id)];
  if (f.color?.length) vConds.push(inArray(productVariants.color, f.color));
  if (f.storage?.length) vConds.push(inArray(productVariants.storage, f.storage));
  if (f.ram?.length) vConds.push(inArray(productVariants.ram, f.ram));
  if (f.inStock) vConds.push(sql`${productVariants.stock} > 0`);
  if (vConds.length > 1) {
    conds.push(exists(db.select({ one: sql`1` }).from(productVariants).where(and(...vConds))));
  }
  const where = and(...conds);
  const orderBy =
    f.sort === "cheapest"
      ? [asc(products.basePrice)]
      : f.sort === "expensive"
        ? [desc(products.basePrice)]
        : f.sort === "bestselling"
          ? [desc(products.salesCount)]
          : f.sort === "rating"
            ? [desc(products.ratingAvg), desc(products.ratingCount)]
            : f.sort === "discount"
              ? [desc(products.discountPercent)]
              : [desc(products.createdAt)];
  const perPage = f.perPage ?? 12;
  const page = Math.max(1, f.page ?? 1);
  const [items, [{ total }]] = await Promise.all([
    db
      .select(cardSelect)
      .from(products)
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(where)
      .orderBy(...orderBy)
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { items, total, page, perPage, pages: Math.ceil(total / perPage) };
}

export const getFacets = cache(async () => {
  await ensureSeeded();
  const [colors, storages, rams, priceRange] = await Promise.all([
    db.select({ v: productVariants.color, hex: productVariants.colorHex }).from(productVariants).groupBy(productVariants.color, productVariants.colorHex).orderBy(asc(productVariants.color)),
    db.select({ v: productVariants.storage }).from(productVariants).groupBy(productVariants.storage),
    db.select({ v: productVariants.ram }).from(productVariants).groupBy(productVariants.ram),
    db.select({ min: sql<number>`min(${products.basePrice})`, max: sql<number>`max(${products.basePrice})` }).from(products),
  ]);
  const sortSize = (a: string, b: string) => parseInt(a) * (a.includes("TB") ? 1024 : 1) - parseInt(b) * (b.includes("TB") ? 1024 : 1);
  return {
    colors,
    storages: storages.map((s) => s.v).sort(sortSize),
    rams: rams.map((s) => s.v).sort(sortSize),
    priceRange: priceRange[0],
  };
});

export const getProductBySlug = cache(async (slug: string) => {
  await ensureSeeded();
  const p = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isActive, true)),
    with: {
      brand: true,
      category: true,
      images: { orderBy: asc(productImages.sortOrder) },
      variants: { orderBy: asc(productVariants.id) },
      reviews: { where: eq(reviews.isApproved, true), orderBy: desc(reviews.createdAt) },
    },
  });
  return p ?? null;
});

export async function getRelatedProducts(productId: number, categoryId: number | null, brandId: number | null) {
  return db
    .select(cardSelect)
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.isActive, true), ne(products.id, productId), or(categoryId ? eq(products.categoryId, categoryId) : sql`false`, brandId ? eq(products.brandId, brandId) : sql`false`)))
    .orderBy(desc(products.salesCount))
    .limit(8);
}

export async function searchProducts(q: string, limit = 6) {
  await ensureSeeded();
  if (!q.trim()) return [];
  const like = `%${q.trim()}%`;
  return db
    .select({ id: products.id, name: products.name, slug: products.slug, basePrice: products.basePrice, image: sql<string | null>`(${firstImage})`, brandName: brands.name })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(eq(products.isActive, true), or(ilike(products.name, like), ilike(products.slug, like), ilike(brands.name, like))))
    .orderBy(desc(products.salesCount))
    .limit(limit);
}

export const getCategoryBySlug = cache(async (slug: string) => {
  await ensureSeeded();
  const [c] = await db.select().from(categories).where(eq(categories.slug, slug));
  return c ?? null;
});
export const getBrandBySlug = cache(async (slug: string) => {
  await ensureSeeded();
  const [b] = await db.select().from(brands).where(eq(brands.slug, slug));
  return b ?? null;
});

export async function getCategoryCounts() {
  return db
    .select({ categoryId: products.categoryId, c: count() })
    .from(products)
    .where(eq(products.isActive, true))
    .groupBy(products.categoryId);
}

export async function getVariantsByIds(ids: number[]) {
  if (!ids.length) return [];
  return db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      color: productVariants.color,
      colorHex: productVariants.colorHex,
      storage: productVariants.storage,
      ram: productVariants.ram,
      price: productVariants.price,
      stock: productVariants.stock,
      productName: products.name,
      slug: products.slug,
      image: sql<string | null>`(${firstImage})`,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(inArray(productVariants.id, ids));
}

// ---------- Account ----------
export async function getUserOrders(userId: number) {
  return db.query.orders.findMany({ where: eq(orders.userId, userId), orderBy: desc(orders.createdAt), with: { items: true } });
}
export async function getOrderForUser(id: number, userId: number) {
  return db.query.orders.findFirst({ where: and(eq(orders.id, id), eq(orders.userId, userId)), with: { items: true, history: { orderBy: asc(orderStatusHistory.createdAt) } } });
}
export async function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({ where: eq(orders.orderNumber, orderNumber), with: { items: true, history: { orderBy: asc(orderStatusHistory.createdAt) } } });
}
export async function getUserAddresses(userId: number) {
  return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault), asc(addresses.id));
}
export async function getUserWishlist(userId: number) {
  return db
    .select(cardSelect)
    .from(wishlists)
    .innerJoin(products, eq(products.id, wishlists.productId))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(wishlists.userId, userId))
    .orderBy(desc(wishlists.createdAt));
}
export async function getUserWishlistIds(userId: number) {
  const rows = await db.select({ productId: wishlists.productId }).from(wishlists).where(eq(wishlists.userId, userId));
  return rows.map((r) => r.productId);
}
export async function getUserLoyalty(userId: number) {
  const [tx, personal] = await Promise.all([
    db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.userId, userId)).orderBy(desc(loyaltyTransactions.createdAt)),
    db.select().from(coupons).where(and(eq(coupons.userId, userId), eq(coupons.isActive, true))),
  ]);
  return { transactions: tx, personalCoupons: personal };
}

export async function getPageBySlug(slug: string) {
  await ensureSeeded();
  const [p] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.isPublished, true)));
  return p ?? null;
}
export async function getPublishedPages() {
  await ensureSeeded();
  return db.select({ title: pages.title, slug: pages.slug }).from(pages).where(eq(pages.isPublished, true));
}
export async function getActiveGateways() {
  await ensureSeeded();
  return db.select().from(paymentGateways).where(eq(paymentGateways.isActive, true)).orderBy(asc(paymentGateways.sortOrder));
}

// ---------- Articles / Blog ----------
export async function getArticleCategories() {
  await ensureSeeded();
  return db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder), asc(articleCategories.id));
}

export async function getArticles({
  category,
  publishedOnly = true,
  page = 1,
  perPage = 12,
}: { category?: string; publishedOnly?: boolean; page?: number; perPage?: number } = {}) {
  await ensureSeeded();
  const conds = [];
  if (publishedOnly) conds.push(eq(articles.isPublished, true));
  if (category) {
    const cat = db.select({ id: articleCategories.id }).from(articleCategories).where(eq(articleCategories.slug, category));
    conds.push(inArray(articles.categoryId, cat));
  }
  const where = conds.length ? and(...conds) : undefined;
  const q = db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      coverImage: articles.coverImage,
      authorName: articles.authorName,
      tags: articles.tags,
      viewsCount: articles.viewsCount,
      publishedAt: articles.publishedAt,
      categoryName: articleCategories.name,
      categorySlug: articleCategories.slug,
    })
    .from(articles)
    .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .orderBy(desc(articles.publishedAt), desc(articles.id));
  const [items, [{ total }]] = await Promise.all([
    q.limit(perPage).offset((Math.max(1, page) - 1) * perPage).where(where),
    db.select({ total: count() }).from(articles).where(where ?? sql`true`),
  ]);
  return { items, total, page: Math.max(1, page), perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export const getArticleBySlug = cache(async (slug: string) => {
  await ensureSeeded();
  return db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.isPublished, true)),
    with: { category: true },
  });
});

export async function getLatestArticles(limit = 3) {
  const { items } = await getArticles({ page: 1, perPage: limit });
  return items;
}

export async function getRelatedArticles(excludeId: number, categoryId: number | null, limit = 3) {
  await ensureSeeded();
  return db
    .select({ id: articles.id, title: articles.title, slug: articles.slug, coverImage: articles.coverImage, publishedAt: articles.publishedAt, excerpt: articles.excerpt, categoryName: articleCategories.name, categorySlug: articleCategories.slug })
    .from(articles)
    .leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id))
    .where(and(eq(articles.isPublished, true), ne(articles.id, excludeId), categoryId ? eq(articles.categoryId, categoryId) : sql`true`))
    .orderBy(desc(articles.publishedAt))
    .limit(limit);
}

// ---------- Media Library ----------
export async function getMediaItems({ query = "", page = 1, perPage = 60 } = {}) {
  await ensureSeeded();
  const where = query ? ilike(media.originalName, `%${query}%`) : undefined;
  const [items, [{ total }]] = await Promise.all([
    db.select().from(media).where(where).orderBy(desc(media.createdAt)).limit(perPage).offset((Math.max(1, page) - 1) * perPage),
    db.select({ total: count() }).from(media).where(where ?? sql`true`),
  ]);
  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

// ---------- Admin ----------
export async function getAdminStats() {
  const [[totals], [userCount], [productCount], statusRows, daily, topProducts, recentOrders, lowStock] = await Promise.all([
    db.select({ revenue: sql<number>`coalesce(sum(case when ${orders.paymentStatus}='paid' then ${orders.total} else 0 end),0)::bigint`, orderCount: count() }).from(orders),
    db.select({ c: count() }).from(users).where(eq(users.role, "customer")),
    db.select({ c: count() }).from(products),
    db.select({ status: orders.status, c: count() }).from(orders).groupBy(orders.status),
    db
      .select({ day: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`, revenue: sql<number>`sum(case when ${orders.paymentStatus}='paid' then ${orders.total} else 0 end)::bigint`, c: count() })
      .from(orders)
      .where(gte(orders.createdAt, sql`now() - interval '90 days'`))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    db.select({ name: products.name, slug: products.slug, salesCount: products.salesCount, basePrice: products.basePrice }).from(products).orderBy(desc(products.salesCount)).limit(6),
    db.query.orders.findMany({ orderBy: desc(orders.createdAt), limit: 8, with: { user: { columns: { name: true } } } }),
    db
      .select({ name: products.name, slug: products.slug, stock: sql<number>`coalesce(sum(${productVariants.stock}),0)::int` })
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .groupBy(products.id)
      .having(sql`coalesce(sum(${productVariants.stock}),0) < 5`)
      .limit(6),
  ]);
  return { revenue: Number(totals.revenue), orderCount: totals.orderCount, userCount: userCount.c, productCount: productCount.c, statusRows, daily: daily.map((d) => ({ ...d, revenue: Number(d.revenue) })), topProducts, recentOrders, lowStock };
}

export async function getAdminOrders(status?: string) {
  return db.query.orders.findMany({
    where: status ? eq(orders.status, status as typeof orders.status.enumValues[number]) : undefined,
    orderBy: desc(orders.createdAt),
    with: { user: { columns: { name: true, email: true } }, items: true },
  });
}
export async function getAdminOrder(id: number) {
  return db.query.orders.findFirst({ where: eq(orders.id, id), with: { user: { columns: { name: true, email: true, phone: true } }, items: true, history: { orderBy: asc(orderStatusHistory.createdAt) } } });
}
export async function getAdminProducts() {
  return db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      discountPercent: products.discountPercent,
      isActive: products.isActive,
      isFeatured: products.isFeatured,
      salesCount: products.salesCount,
      brandName: brands.name,
      categoryName: categories.name,
      image: sql<string | null>`(${firstImage})`,
      stock: sql<number>`(${stockSum})::int`,
    })
    .from(products)
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}
export async function getAdminProduct(id: number) {
  return db.query.products.findFirst({ where: eq(products.id, id), with: { images: { orderBy: asc(productImages.sortOrder) }, variants: { orderBy: asc(productVariants.id) } } });
}
export async function getAdminUsers() {
  const orderCounts = db
    .select({ userId: orders.userId, c: count().as("c"), spent: sql<number>`coalesce(sum(case when ${orders.paymentStatus}='paid' then ${orders.total} else 0 end),0)`.as("spent") })
    .from(orders)
    .groupBy(orders.userId)
    .as("oc");
  return db
    .select({ id: users.id, name: users.name, email: users.email, phone: users.phone, role: users.role, permissions: users.permissions, loyaltyPoints: users.loyaltyPoints, loyaltyTier: users.loyaltyTier, personalCoupon: users.personalCoupon, isActive: users.isActive, createdAt: users.createdAt, orderCount: sql<number>`coalesce(${orderCounts.c},0)::int`, spent: sql<number>`coalesce(${orderCounts.spent},0)::bigint` })
    .from(users)
    .leftJoin(orderCounts, eq(orderCounts.userId, users.id))
    .orderBy(desc(users.createdAt));
}
export async function getAdminCoupons() {
  return db.select({ coupon: coupons, userName: users.name }).from(coupons).leftJoin(users, eq(users.id, coupons.userId)).orderBy(desc(coupons.createdAt));
}
export async function getAllBanners() {
  return db.select().from(banners).orderBy(asc(banners.position), asc(banners.sortOrder));
}
export async function getAllPages() {
  return db.select().from(pages).orderBy(asc(pages.title));
}
export async function getAllGateways() {
  return db.select().from(paymentGateways).orderBy(asc(paymentGateways.sortOrder));
}
export async function getAllReviews() {
  return db.select({ review: reviews, productName: products.name, productSlug: products.slug }).from(reviews).innerJoin(products, eq(products.id, reviews.productId)).orderBy(desc(reviews.createdAt)).limit(100);
}

export async function getAdminArticles() {
  return db.select({ article: articles, categoryName: articleCategories.name }).from(articles).leftJoin(articleCategories, eq(articles.categoryId, articleCategories.id)).orderBy(desc(articles.createdAt));
}
export async function getAdminArticle(id: number) {
  return db.query.articles.findFirst({ where: eq(articles.id, id), with: { category: true } });
}
export async function getAdminArticleCategories() {
  return db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder), asc(articleCategories.id));
}
export async function getAdminMedia() {
  return db.select().from(media).orderBy(desc(media.createdAt));
}
