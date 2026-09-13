import type { Metadata } from "next";
import { ProductListing, type SP } from "@/components/product/ProductListing";
import { getBrandBySlug } from "@/lib/data";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const brandSlug = typeof sp.brand === "string" && !sp.brand.includes(",") ? sp.brand : undefined;
  const brand = brandSlug ? await getBrandBySlug(brandSlug) : null;
  const title = q ? `جستجوی «${q}»` : brand ? `خرید گوشی ${brand.name}` : "همه محصولات";
  return {
    title,
    description: brand ? `لیست قیمت و خرید گوشی‌های ${brand.name} با گارانتی معتبر` : "لیست کامل گوشی‌های موبایل با فیلتر برند، قیمت، رنگ، حافظه و رم",
    alternates: { canonical: brand ? `/products?brand=${brand.slug}` : "/products" },
    robots: q ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const brandSlug = typeof sp.brand === "string" && !sp.brand.includes(",") ? sp.brand : undefined;
  const brand = brandSlug ? await getBrandBySlug(brandSlug) : null;
  return <ProductListing sp={sp} basePath="/products" title={brand ? `گوشی‌های ${brand.name}` : "همه محصولات"} description={brand?.description ?? "تمام گوشی‌های موبایل موجود در فروشگاه با امکان فیلتر بر اساس برند، قیمت، رنگ، حافظه و رم"} />;
}
