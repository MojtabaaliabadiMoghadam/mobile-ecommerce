import Link from "next/link";
import type { ProductCardData } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { WishlistButton } from "./WishlistButton";

export function ProductCard({ p, wished = false, priority = false }: { p: ProductCardData; wished?: boolean; priority?: boolean }) {
  return (
    <article className="card group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-600/10">
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        {p.discountPercent > 0 && <span className="badge bg-rose-500 text-white shadow">{new Intl.NumberFormat("fa-IR").format(p.discountPercent)}٪ تخفیف</span>}
        {p.isFeatured && <span className="badge bg-amber-400 text-amber-950 shadow">ویژه</span>}
      </div>
      <div className="absolute left-3 top-3 z-10 opacity-0 transition group-hover:opacity-100 max-lg:opacity-100">
        <WishlistButton productId={p.id} initial={wished} />
      </div>
      <Link href={`/product/${p.slug}`} className="block aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={p.image ?? "/images/hero.jpg"}
          alt={p.imageAlt ?? p.name}
          width={400}
          height={400}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs text-slate-400">{p.brandName}</span>
        <Link href={`/product/${p.slug}`} className="mt-1 line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-6 text-slate-800 transition hover:text-brand-600 dark:text-slate-100">
          {p.name}
        </Link>
        <div className="mt-2">
          <Rating value={Number(p.ratingAvg)} count={p.ratingCount} />
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            {p.compareAtPrice && <p className="text-xs text-slate-400 line-through">{formatPrice(p.compareAtPrice)}</p>}
            <p className="text-base font-bold text-slate-900 dark:text-white">{formatPrice(p.basePrice)}</p>
          </div>
          {!p.inStock && <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800">ناموجود</span>}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square rounded-none" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton mt-3 h-5 w-24" />
      </div>
    </div>
  );
}
