import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages } from "@/lib/data";
import { formatDateShort } from "@/lib/utils";

export async function generateStaticParams() {
  const p = await getPublishedPages();
  return p.map((x) => ({ slug: x.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPageBySlug(slug);
  if (!p) return {};
  return { title: p.metaTitle ?? p.title, description: p.metaDescription ?? undefined, alternates: { canonical: `/p/${p.slug}` } };
}
export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPageBySlug(slug);
  if (!p) notFound();
  return (
    <article className="container-x mt-8 max-w-3xl">
      <h1 className="text-2xl font-extrabold">{p.title}</h1>
      <p className="mt-1 text-xs text-slate-400">آخرین به‌روزرسانی: {formatDateShort(p.updatedAt)}</p>
      <div className="card prose-fa mt-6 whitespace-pre-line p-6 text-sm">{p.content}</div>
    </article>
  );
}
