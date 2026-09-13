import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import { getAllPages } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";
import { EditorModal } from "@/components/admin/EditorModal";
import { ActionButton } from "@/components/admin/ActionForm";
import { deletePage, savePage } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
type Pg = Awaited<ReturnType<typeof getAllPages>>[number];

function Fields({ p }: { p?: Pg }) {
  return (
    <>
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">عنوان *</label><input name="title" required defaultValue={p?.title} className="input" /></div>
        <div><label className="label">Slug</label><input name="slug" defaultValue={p?.slug} className="input" dir="ltr" /></div>
        <div className="sm:col-span-2"><label className="label">محتوا *</label><textarea name="content" required rows={8} defaultValue={p?.content} className="input" /></div>
        <div><label className="label">Meta Title</label><input name="metaTitle" defaultValue={p?.metaTitle ?? ""} className="input" /></div>
        <div><label className="label">Meta Description</label><input name="metaDescription" defaultValue={p?.metaDescription ?? ""} className="input" /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isPublished" defaultChecked={p?.isPublished ?? true} className="accent-brand-600" /> منتشر شده</label>
      </div>
    </>
  );
}

export default async function AdminPages() {
  if (!hasPermission(await getCurrentUser(), "content")) redirect("/admin");
  const list = await getAllPages();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">صفحات استاتیک</h1>
        <EditorModal title="صفحه جدید" action={savePage} triggerClass="btn-primary" trigger={<><Plus className="h-4 w-4" /> صفحه جدید</>}><Fields /></EditorModal>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>عنوان</th><th>آدرس</th><th>Meta Title</th><th>به‌روزرسانی</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="font-medium">{p.title}</td>
                <td><Link href={`/p/${p.slug}`} target="_blank" className="flex items-center gap-1 text-brand-600" dir="ltr">/p/{p.slug} <ExternalLink className="h-3 w-3" /></Link></td>
                <td className="max-w-xs truncate text-slate-500">{p.metaTitle}</td>
                <td className="text-slate-500">{formatDateShort(p.updatedAt)}</td>
                <td><span className={`badge ${p.isPublished ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{p.isPublished ? "منتشر شده" : "پیش‌نویس"}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <EditorModal title={`ویرایش ${p.title}`} action={savePage} trigger={<Pencil className="h-3.5 w-3.5" />} triggerClass="btn-ghost h-8 w-8 p-0"><Fields p={p} /></EditorModal>
                    <ActionButton action={deletePage.bind(null, p.id)}><Trash2 className="h-4 w-4" /></ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
