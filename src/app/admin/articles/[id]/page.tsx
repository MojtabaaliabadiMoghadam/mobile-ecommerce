import { notFound, redirect } from "next/navigation";
import { getAdminArticle, getAdminArticleCategories } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }: { params: Promise<{ id: string }> }) {
  if (!hasPermission(await getCurrentUser(), "content")) redirect("/admin");
  const { id } = await params;
  const cats = await getAdminArticleCategories();
  if (id === "new") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold">مقاله جدید</h1>
        <ArticleForm categories={cats} />
      </div>
    );
  }
  const a = await getAdminArticle(Number(id));
  if (!a) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">ویرایش: {a.title}</h1>
      <ArticleForm categories={cats} article={a} />
    </div>
  );
}
