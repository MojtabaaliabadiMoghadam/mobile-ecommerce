import type { MetadataRoute } from "next";
import { db } from "@/db";
import { products, categories, pages, brands, articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SITE_URL } from "@/lib/utils";
import { ensureSeeded } from "@/lib/seed";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureSeeded();
  const [ps, cs, pg, bs, ar] = await Promise.all([
    db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true)),
    db.select({ slug: categories.slug }).from(categories),
    db.select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages).where(eq(pages.isPublished, true)),
    db.select({ slug: brands.slug }).from(brands),
    db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.isPublished, true)),
  ]);
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    ...cs.map((c) => ({ url: `${SITE_URL}/category/${c.slug}`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 })),
    ...bs.map((b) => ({ url: `${SITE_URL}/products?brand=${b.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...ps.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...ar.map((a) => ({ url: `${SITE_URL}/blog/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...pg.map((p) => ({ url: `${SITE_URL}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.4 })),
  ];
}
