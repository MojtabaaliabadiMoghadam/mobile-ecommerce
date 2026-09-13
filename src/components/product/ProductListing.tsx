import Link from "next/link";
import { Suspense } from "react";
import { getBrands, getFacets, getProducts, getUserWishlistIds, type ProductFilters } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "./ProductCard";
import { Filters, SortBar } from "./Filters";
import { PackageSearch } from "lucide-react";

export type SP = Record<string, string | string[] | undefined>;

export function parseFilters(sp: SP, category?: string): ProductFilters {
  const arr = (k: string) => ([] as string[]).concat(sp[k] ?? []).flatMap((v) => v.split(",")).filter(Boolean);
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  return {
    q: one("q") || undefined,
    category,
    brand: arr("brand"),
    color: arr("color"),
    storage: arr("storage"),
    ram: arr("ram"),
    minPrice: Number(one("min")) || undefined,
    maxPrice: Number(one("max")) || undefined,
    inStock: one("inStock") === "1",
    sort: (one("sort") as ProductFilters["sort"]) || "newest",
    page: Number(one("page")) || 1,
  };
}

export async function ProductListing({ sp, category, title, description, basePath }: { sp: SP; category?: string; title: string; description?: string; basePath: string }) {
  const filters = parseFilters(sp, category);
  const [result, facets, brands, user] = await Promise.all([getProducts(filters), getFacets(), getBrands(), getCurrentUser()]);
  const wished = user ? await getUserWishlistIds(user.id) : [];
  const qs = new URLSearchParams();
  Object.entries(sp).forEach(([k, v]) => {
    if (k === "page" || v === undefined) return;
    ([] as string[]).concat(v).forEach((x) => qs.append(k, x));
  });
  const pageHref = (p: number) => {
    const q = new URLSearchParams(qs);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="container-x mt-6">
      <nav aria-label="breadcrumb" className="mb-4 text-xs text-slate-500">
        <Link href="/" className="hover:text-brand-600">خانه</Link> <span className="mx-1">/</span>
        <Link href="/products" className="hover:text-brand-600">محصولات</Link>
        {category && <><span className="mx-1">/</span><span className="text-slate-700 dark:text-slate-200">{title}</span></>}
      </nav>
      <h1 className="text-2xl font-extrabold">{filters.q ? `نتایج جستجو برای «${filters.q}»` : title}</h1>
      {description && <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{description}</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <Suspense>
          <Filters brands={brands} colors={facets.colors} storages={facets.storages} rams={facets.rams} priceRange={facets.priceRange} />
        </Suspense>
        <div>
          <div className="card mb-4 px-4 py-3">
            <Suspense>
              <SortBar total={result.total} />
            </Suspense>
          </div>
          {result.items.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-20 text-center">
              <PackageSearch className="h-12 w-12 text-slate-300" />
              <p className="font-semibold">محصولی با این مشخصات یافت نشد</p>
              <Link href={basePath} className="btn-secondary">حذف فیلترها</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} p={p} wished={wished.includes(p.id)} priority={i < 3} />
              ))}
            </div>
          )}
          {result.pages > 1 && (
            <nav className="mt-8 flex justify-center gap-1" aria-label="صفحه‌بندی">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={pageHref(p)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${p === result.page ? "bg-brand-600 text-white" : "card hover:border-brand-400"}`}>
                  {new Intl.NumberFormat("fa-IR").format(p)}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
