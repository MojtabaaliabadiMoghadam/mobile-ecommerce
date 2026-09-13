import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getProductBySlug, getRelatedProducts, getUserWishlistIds } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatDateShort, SITE_URL } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { Gallery, ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ReviewForm } from "@/components/product/ReviewForm";
import { ProductCard } from "@/components/product/ProductCard";
import { WishlistButton } from "@/components/product/WishlistButton";

export async function generateStaticParams() {
  const rows = await db.select({ slug: products.slug }).from(products).where(eq(products.isActive, true));
  return rows.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "محصول یافت نشد" };
  const title = p.metaTitle ?? `خرید ${p.name}`;
  const description = p.metaDescription ?? p.shortDescription ?? undefined;
  const img = p.images[0]?.url ?? "/images/hero.jpg";
  return {
    title,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/product/${p.slug}`, images: [{ url: img, alt: p.images[0]?.alt ?? p.name }], siteName: "اکسیر موبایل", locale: "fa_IR" },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const [related, user] = await Promise.all([getRelatedProducts(p.id, p.categoryId, p.brandId), getCurrentUser()]);
  const wished = user ? await getUserWishlistIds(user.id) : [];
  db.update(products).set({ viewsCount: sql`${products.viewsCount} + 1` }).where(eq(products.id, p.id)).catch(() => {});

  const inStock = p.variants.some((v) => v.stock > 0);
  const prices = p.variants.map((v) => v.price);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => `${SITE_URL}${i.url}`),
    description: p.shortDescription,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand.name } : undefined,
    category: p.category?.name,
    offers: {
      "@type": "AggregateOffer",
      url: `${SITE_URL}/product/${p.slug}`,
      priceCurrency: "IRR",
      lowPrice: Math.min(...prices) * 10,
      highPrice: Math.max(...prices) * 10,
      offerCount: p.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "اکسیر موبایل" },
    },
    aggregateRating: p.ratingCount > 0 ? { "@type": "AggregateRating", ratingValue: Number(p.ratingAvg), reviewCount: p.ratingCount, bestRating: 5, worstRating: 1 } : undefined,
    review: p.reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.authorName }, datePublished: r.createdAt.toISOString().slice(0, 10), reviewBody: r.body, name: r.title, reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 } })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: p.category?.name ?? "محصولات", item: `${SITE_URL}/category/${p.category?.slug ?? ""}` },
      { "@type": "ListItem", position: 3, name: p.name, item: `${SITE_URL}/product/${p.slug}` },
    ],
  };
  const ratingDist = [5, 4, 3, 2, 1].map((s) => ({ s, c: p.reviews.filter((r) => r.rating === s).length }));

  return (
    <div className="container-x mt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <nav aria-label="breadcrumb" className="mb-4 flex flex-wrap gap-1 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">خانه</Link> /
        {p.category && <><Link href={`/category/${p.category.slug}`} className="hover:text-brand-600">{p.category.name}</Link> /</>}
        {p.brand && <><Link href={`/products?brand=${p.brand.slug}`} className="hover:text-brand-600">{p.brand.name}</Link> /</>}
        <span className="text-slate-700 dark:text-slate-200">{p.name}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr_360px]">
        <Gallery images={p.images} name={p.name} />
        <div className="animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-extrabold leading-9 sm:text-2xl">{p.name}</h1>
            <WishlistButton productId={p.id} initial={wished.includes(p.id)} className="shrink-0 border border-slate-200 dark:border-slate-700" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Rating value={Number(p.ratingAvg)} count={p.ratingCount} />
            <span>•</span>
            <span>{new Intl.NumberFormat("fa-IR").format(p.salesCount)} فروش</span>
            {p.sku && <><span>•</span><span dir="ltr">{p.sku}</span></>}
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{p.shortDescription}</p>
          <h2 className="mt-6 mb-3 font-bold">مشخصات کلیدی</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800/70">
                <dt className="text-[11px] text-slate-500">{k}</dt>
                <dd className="text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ProductBuyBox product={{ id: p.id, name: p.name, slug: p.slug, image: p.images[0]?.url ?? null, compareAtPrice: p.compareAtPrice, discountPercent: p.discountPercent }} variants={p.variants} />
      </div>

      {/* Description */}
      <section className="card mt-10 p-6">
        <h2 className="section-title mb-4">معرفی {p.name}</h2>
        <div className="prose-fa whitespace-pre-line text-sm">{p.description}</div>
      </section>

      {/* Reviews */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]" id="reviews">
        <div>
          <h2 className="section-title mb-4">نظرات کاربران</h2>
          <div className="card p-5">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-extrabold">{new Intl.NumberFormat("fa-IR").format(Number(p.ratingAvg))}</span>
              <span className="pb-1 text-sm text-slate-500">از ۵ ({new Intl.NumberFormat("fa-IR").format(p.ratingCount)} نظر)</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {ratingDist.map((d) => (
                <div key={d.s} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{d.s}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${p.reviews.length ? (d.c / p.reviews.length) * 100 : 0}%` }} />
                  </div>
                  <span className="w-5 text-slate-400">{d.c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4"><ReviewForm productId={p.id} slug={p.slug} loggedIn={!!user} /></div>
        </div>
        <div className="space-y-3 pt-0 lg:pt-12">
          {p.reviews.length === 0 && <p className="card p-6 text-center text-sm text-slate-500">هنوز نظری ثبت نشده. اولین نفر باشید!</p>}
          {p.reviews.map((r) => (
            <article key={r.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-200">{r.authorName.charAt(0)}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.authorName}</p>
                    <p className="text-[11px] text-slate-400">{formatDateShort(r.createdAt)}</p>
                  </div>
                </div>
                <Rating value={r.rating} />
              </div>
              {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
              <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-5">محصولات مرتبط</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.slice(0, 4).map((r) => <ProductCard key={r.id} p={r} wished={wished.includes(r.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
