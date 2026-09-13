import { redirect } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { getAllBanners } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { EditorModal } from "@/components/admin/EditorModal";
import { ActionButton } from "@/components/admin/ActionForm";
import { deleteBanner, saveBanner } from "@/app/actions/admin";
import { BannerFields } from "@/components/admin/BannerFields";

export const dynamic = "force-dynamic";

export default async function AdminBanners() {
  if (!hasPermission(await getCurrentUser(), "content")) redirect("/admin");
  const list = await getAllBanners();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">بنرها</h1>
        <EditorModal title="بنر جدید" action={saveBanner} triggerClass="btn-primary" trigger={<><Plus className="h-4 w-4" /> بنر جدید</>}><BannerFields /></EditorModal>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((b) => (
          <div key={b.id} className="card overflow-hidden">
            <div className="relative h-40 bg-slate-100 dark:bg-slate-800">
              <img src={b.image} alt={b.title} loading="lazy" className="h-full w-full object-cover" />
              <span className={`badge absolute right-2 top-2 ${b.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>{b.isActive ? "فعال" : "غیرفعال"}</span>
              <span className="badge absolute left-2 top-2 bg-white/90 text-slate-700">{b.position === "hero" ? "اصلی" : "کناری"} #{b.sortOrder}</span>
            </div>
            <div className="p-4">
              <p className="font-bold">{b.title}</p>
              <p className="text-xs text-slate-500">{b.subtitle}</p>
              <p className="mt-1 text-xs text-brand-600" dir="ltr">{b.link}</p>
              <div className="mt-3 flex gap-1">
                <EditorModal title="ویرایش بنر" action={saveBanner} trigger={<><Pencil className="h-3.5 w-3.5" /> ویرایش</>}><BannerFields b={b} /></EditorModal>
                <ActionButton action={deleteBanner.bind(null, b.id)}><Trash2 className="h-4 w-4" /></ActionButton>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
