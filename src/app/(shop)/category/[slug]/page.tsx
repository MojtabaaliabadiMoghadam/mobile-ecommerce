import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing, type SP } from "@/components/product/ProductListing";
import { getCategories, getCategoryBySlug } from "@/lib/data";
import { SITE_URL } from "@/lib/utils";

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCategoryBySlug(slug);
  if (!c) return {};
  return {
    title: c.metaTitle ?? c.name,
    description: c.metaDescription ?? c.description ?? undefined,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: { title: c.metaTitle ?? c.name, description: c.metaDescription ?? undefined, url: `${SITE_URL}/category/${c.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<SP> }) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const c = await getCategoryBySlug(slug);
  if (!c) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "محصولات", item: `${SITE_URL}/products` },
      { "@type": "ListItem", position: 3, name: c.name, item: `${SITE_URL}/category/${c.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductListing sp={sp} category={c.slug} basePath={`/category/${c.slug}`} title={c.name} description={c.description ?? undefined} />
    </>
  );
}
