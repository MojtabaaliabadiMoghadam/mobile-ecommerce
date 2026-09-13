import Link from "next/link";
import { ArrowLeft, Flame, Sparkles, Clock, Percent, Store, Truck } from "lucide-react";
import { getBanners, getCategories, getBrands, getHomeData, getUserWishlistIds, getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { ProductCard } from "@/components/product/ProductCard";
import { SITE_URL } from "@/lib/utils";
import type { ProductCardData } from "@/lib/data";

export const revalidate = 60;

function Section({ title, icon: Icon, href, items, wished }: { title: string; icon: React.ElementType; href: string; items: ProductCardData[]; wished: number[] }) {
  if (!items.length) return null;
  return (
    <section className="container-x mt-14 animate-fade-up">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Icon className="h-5 w-5" /></span>
          {title}
        </h2>
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-300">
          مشاهده همه <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.slice(0, 8).map((p) => (
          <ProductCard key={p.id} p={p} wished={wished.includes(p.id)} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [heroBanners, sideBanners, cats, brands, home, user, s] = await Promise.all([getBanners("hero"), getBanners("side"), getCategories(), getBrands(), getHomeData(), getCurrentUser(), getSettings()]);
  const wished = user ? await getUserWishlistIds(user.id) : [];
  const hero = heroBanners[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", name: s.site_name, url: SITE_URL, logo: `${SITE_URL}/images/hero.jpg`, address: { "@type": "PostalAddress", streetAddress: s.store_address, addressCountry: "IR" }, telephone: s.store_phone },
      { "@type": "WebSite", name: s.site_name, url: SITE_URL, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/products?q={search_term_string}`, "query-input": "required name=search_term_string" } },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="container-x mt-6 grid gap-4 lg:grid-cols-3">
        {hero && (
          <Link href={hero.link ?? "/products"} className="group relative col-span-2 block overflow-hidden rounded-3xl shadow-lg" style={{ minHeight: 320 }}>
            <img src={hero.image} alt={hero.title} width={1200} height={480} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-l from-slate-950/80 via-slate-950/40 to-transparent" />
            <div className="relative flex h-full min-h-[320px] flex-col justify-end p-6 text-white sm:p-10">
              <span className="badge mb-3 w-fit bg-white/20 text-white backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> پیشنهاد ویژه</span>
              <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">{hero.title}</h1>
              <p className="mt-2 max-w-lg text-sm text-white/85 sm:text-base">{hero.subtitle}</p>
              <span className="btn-primary mt-5 w-fit">مشاهده محصولات <ArrowLeft className="h-4 w-4" /></span>
            </div>
          </Link>
        )}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {sideBanners.slice(0, 2).map((b) => (
            <Link key={b.id} href={b.link ?? "/products"} className="group relative block overflow-hidden rounded-3xl bg-slate-200 shadow dark:bg-slate-800" style={{ minHeight: 150 }}>
              <img src={b.image} alt={b.title} width={400} height={300} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <div className="relative flex h-full min-h-[150px] flex-col justify-end p-4 text-white">
                <h3 className="font-bold">{b.title}</h3>
                <p className="text-xs text-white/80">{b.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x mt-10">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {cats.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="card flex min-w-36 flex-1 flex-col items-center gap-2 px-4 py-5 text-center transition hover:border-brand-400 hover:shadow-md">
              <span className="text-2xl">📱</span>
              <span className="text-sm font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <Section title="محصولات ویژه" icon={Sparkles} href="/products?sort=bestselling" items={home.featured} wished={wished} />

      {/* Online + In-store */}
      <section className="container-x mt-14 grid gap-4 md:grid-cols-2">
        <div className="card flex items-center gap-4 bg-gradient-to-l from-brand-600 to-violet-600 p-6 text-white">
          <Truck className="h-12 w-12 shrink-0 opacity-90" />
          <div>
            <h3 className="text-lg font-bold">خرید آنلاین با ارسال سریع</h3>
            <p className="text-sm text-white/85">پرداخت امن با درگاه زرین‌پال یا پرداخت در محل؛ ارسال رایگان برای سفارش‌های بالای ۳۰ میلیون تومان</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 bg-gradient-to-l from-emerald-600 to-teal-600 p-6 text-white">
          <Store className="h-12 w-12 shrink-0 opacity-90" />
          <div>
            <h3 className="text-lg font-bold">خرید و تحویل حضوری</h3>
            <p className="text-sm text-white/85">آنلاین رزرو کنید، حضوری در فروشگاه تحویل بگیرید و همان‌جا پرداخت کنید</p>
          </div>
        </div>
      </section>

      <Section title="پرفروش‌ترین‌ها" icon={Flame} href="/products?sort=bestselling" items={home.bestsellers} wished={wished} />
      <Section title="تخفیف‌های داغ" icon={Percent} href="/products?sort=discount" items={home.discounted} wished={wished} />
      <Section title="تازه‌ترین‌ها" icon={Clock} href="/products?sort=newest" items={home.newest} wished={wished} />

      {/* Brands */}
      <section className="container-x mt-14">
        <h2 className="section-title mb-5">برندها</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {brands.map((b) => (
            <Link key={b.slug} href={`/products?brand=${b.slug}`} className="card flex items-center justify-center py-5 text-sm font-bold transition hover:border-brand-400 hover:text-brand-600">
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
