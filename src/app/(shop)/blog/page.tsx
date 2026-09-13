import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Eye, ArrowLeft } from "lucide-react";
import { getArticles, getArticleCategories } from "@/lib/data";
import { formatDateShort, formatNumber, SITE_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "مقالات و راهنمای خرید",
  description: "جدیدترین مقالات، راهنمای خرید و مقایسه گوشی‌های موبایل در اکسیر موبایل",
  alternates: { canonical: "/blog" },
};

export const revalidate = 60;

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const [result, cats] = await Promise.all([
    getArticles({ category: sp.category, page, perPage: 9 }),
    getArticleCategories(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "مقالات اکسیر موبایل",
    url: `${SITE_URL}/blog`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="container-x mt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold sm:text-3xl">مقالات و راهنمای خرید</h1>
          <p className="mt-2 text-sm text-slate-500">راهنمای خرید، مقایسه و اخبار دنیای موبایل</p>
        </header>

        {/* Category tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
          <Link href="/blog" className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${!sp.category ? "bg-brand-600 text-white" : "card hover:border-brand-400"}`}>
            همه
          </Link>
          {cats.map((c) => (
            <Link key={c.slug} href={`/blog?category=${c.slug}`} className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition ${sp.category === c.slug ? "bg-brand-600 text-white" : "card hover:border-brand-400"}`}>
              {c.name}
            </Link>
          ))}
        </div>

        {result.items.length === 0 ? (
          <div className="card py-20 text-center text-sm text-slate-500">مقاله‌ای در این دسته یافت نشد</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((a, i) => (
              <Link key={a.id} href={`/blog/${a.slug}`} className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={a.coverImage ?? "/images/hero.jpg"} alt={a.title} loading={i < 3 ? "eager" : "lazy"} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  {a.categoryName && <span className="badge mb-2 w-fit bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">{a.categoryName}</span>}
                  <h2 className="line-clamp-2 text-base font-bold leading-7 transition group-hover:text-brand-600">{a.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{a.excerpt}</p>
                  <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {a.publishedAt ? formatDateShort(a.publishedAt) : ""}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {formatNumber(a.viewsCount)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {result.pages > 1 && (
          <nav className="mt-8 flex justify-center gap-1">
            {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?${sp.category ? `category=${sp.category}&` : ""}page=${p}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${p === result.page ? "bg-brand-600 text-white" : "card hover:border-brand-400"}`}
              >
                {formatNumber(p)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
