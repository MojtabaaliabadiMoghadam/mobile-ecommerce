import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getAdminArticles, getAdminArticleCategories } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  if (!hasPermission(await getCurrentUser(), "content")) redirect("/admin");
  const [list, cats] = await Promise.all([getAdminArticles(), getAdminArticleCategories()]);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">مقالات <span className="text-sm font-normal text-slate-500">({formatNumber(list.length)})</span></h1>
        <Link href="/admin/articles/new" className="btn-primary"><Plus className="h-4 w-4" /> مقاله جدید</Link>
      </div>

      <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60">
        دسته‌های مقاله: {cats.map((c) => c.name).join("، ")} — دسته‌ها را می‌توانید در فرم مقاله انتخاب کنید.
      </div>

      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>مقاله</th><th>دسته</th><th>نویسنده</th><th>بازدید</th><th>تاریخ انتشار</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map(({ article: a, categoryName }) => (
              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td>
                  <div className="flex items-center gap-3">
                    <img src={a.coverImage ?? "/images/hero.jpg"} alt={a.title} width={48} height={48} loading="lazy" className="h-12 w-16 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <Link href={`/admin/articles/${a.id}`} className="block max-w-64 truncate font-medium hover:text-brand-600">{a.title}</Link>
                      <p className="text-xs text-slate-400" dir="ltr">/blog/{a.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="text-slate-500">{categoryName ?? "—"}</td>
                <td className="text-slate-500">{a.authorName}</td>
                <td>{formatNumber(a.viewsCount)}</td>
                <td className="text-slate-500">{a.publishedAt ? formatDateShort(a.publishedAt) : "—"}</td>
                <td><span className={`badge ${a.isPublished ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>{a.isPublished ? "منتشر شده" : "پیش‌نویس"}</span></td>
                <td><Link href={`/admin/articles/${a.id}`} className="btn-secondary h-8 px-3 text-xs">ویرایش</Link></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-500">مقاله‌ای ثبت نشده است</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
