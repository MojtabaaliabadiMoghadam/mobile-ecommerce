import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data";
import { formatDateShort, formatNumber, SITE_URL } from "@/lib/utils";
import { Calendar, Eye, User, Tag, ArrowRight } from "lucide-react";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) return { title: "مقاله یافت نشد" };
  return {
    title: a.metaTitle ?? a.title,
    description: a.metaDescription ?? a.excerpt ?? undefined,
    alternates: { canonical: `/blog/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.metaTitle ?? a.title,
      description: a.excerpt ?? undefined,
      url: `${SITE_URL}/blog/${a.slug}`,
      images: a.coverImage ? [{ url: a.coverImage, alt: a.title }] : undefined,
      publishedTime: a.publishedAt?.toISOString(),
      authors: [a.authorName],
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.excerpt ?? undefined },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) notFound();

  db.update(articles).set({ viewsCount: sql`${articles.viewsCount} + 1` }).where(eq(articles.id, a.id)).catch(() => {});

  const related = await getRelatedArticles(a.id, a.categoryId, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    image: a.coverImage ? `${SITE_URL}${a.coverImage}` : undefined,
    author: { "@type": "Person", name: a.authorName },
    datePublished: a.publishedAt?.toISOString(),
    publisher: { "@type": "Organization", name: "اکسیر موبایل", url: SITE_URL },
  };

  return (
    <div className="container-x mt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl">
        <nav className="mb-4 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">خانه</Link> /{" "}
          <Link href="/blog" className="hover:text-brand-600">مقالات</Link> /{" "}
          {a.category && <span className="text-slate-700 dark:text-slate-200">{a.category.name}</span>}
        </nav>

        <header>
          {a.category && <span className="badge mb-3 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{a.category.name}</span>}
          <h1 className="text-2xl font-extrabold leading-10 sm:text-3xl sm:leading-[3rem]">{a.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {a.authorName}</span>
            {a.publishedAt && <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {formatDateShort(a.publishedAt)}</span>}
            <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {formatNumber(a.viewsCount)} بازدید</span>
          </div>
        </header>

        {a.coverImage && (
          <div className="mt-6 overflow-hidden rounded-2xl">
            <img src={a.coverImage} alt={a.title} className="aspect-[16/9] w-full object-cover" fetchPriority="high" />
          </div>
        )}

        <article className="prose-fa mt-8 text-[15px]">
          {a.content.split("\n").filter(Boolean).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>

        {a.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            {a.tags.map((t) => (
              <span key={t} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{t}</span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-800">
            <h2 className="mb-4 text-lg font-bold">مقالات مرتبط</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="card group overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={r.coverImage ?? "/images/hero.jpg"} alt={r.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-6 group-hover:text-brand-600">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex justify-center">
          <Link href="/blog" className="btn-secondary">
            بازگشت به مقالات <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
