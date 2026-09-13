import Link from "next/link";
import { Smartphone, Sparkles, Store, Newspaper } from "lucide-react";
import { getBrands, getCategories, getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchBox } from "./SearchBox";
import { CartButton, MobileNav, UserMenu } from "./HeaderClient";

export async function Header() {
  const [categories, brands, user, s] = await Promise.all([getCategories(), getBrands(), getCurrentUser(), getSettings()]);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      {s.announcement && (
        <div className="bg-gradient-to-l from-brand-600 to-violet-600 py-1.5 text-center text-xs text-white">
          <Sparkles className="ml-1 inline h-3.5 w-3.5" />
          {s.announcement}
        </div>
      )}
      <div className="container-x flex h-16 items-center gap-3">
        <MobileNav categories={categories} brands={brands} />
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30">
            <Smartphone className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">{s.site_name || "اکسیر موبایل"}</span>
        </Link>
        <SearchBox className="mx-2 hidden flex-1 md:block md:max-w-xl" />
        <div className="mr-auto flex items-center gap-1.5">
          <ThemeToggle />
          <CartButton />
          <UserMenu user={user} />
        </div>
      </div>
      <div className="container-x pb-3 md:hidden">
        <SearchBox />
      </div>
      <nav className="hidden border-t border-slate-100 dark:border-slate-800/60 lg:block" aria-label="منوی اصلی">
        <div className="container-x flex h-11 items-center gap-1 text-sm">
          <Link href="/products" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-200 dark:hover:bg-slate-800">
            همه محصولات
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800">
              {c.name}
            </Link>
          ))}
          <span className="mx-2 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          {brands.slice(0, 5).map((b) => (
            <Link key={b.slug} href={`/products?brand=${b.slug}`} className="rounded-lg px-3 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-slate-800">
              {b.name}
            </Link>
          ))}
          <Link href="/blog" className="mx-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
            <Newspaper className="h-4 w-4" /> مقالات
          </Link>
          <Link href="/p/contact" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-slate-600 hover:text-brand-600 dark:text-slate-300">
            <Store className="h-4 w-4" /> فروشگاه حضوری
          </Link>
        </div>
      </nav>
    </header>
  );
}
