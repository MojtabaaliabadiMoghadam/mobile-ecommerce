import { redirect } from "next/navigation";
import { CreditCard, Banknote, Store } from "lucide-react";
import { getAllGateways } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveGateway } from "@/app/actions/admin";

export const dynamic = "force-dynamic";
const icons = { zarinpal: CreditCard, cod: Banknote, in_store: Store } as const;

export default async function AdminGateways() {
  if (!hasPermission(await getCurrentUser(), "payments")) redirect("/admin");
  const list = await getAllGateways();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">درگاه‌های پرداخت</h1>
      <p className="text-sm text-slate-500">روش‌های پرداخت فعال در مرحله تسویه حساب نمایش داده می‌شوند. درگاه زرین‌پال در حالت Sandbox شبیه‌سازی شده است؛ برای اتصال واقعی، merchant_id را وارد و sandbox را false کنید.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {list.map((g) => {
          const Icon = icons[g.key as keyof typeof icons] ?? CreditCard;
          return (
            <div key={g.id} className="card p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"><Icon className="h-5 w-5" /></span>
                <div><p className="font-bold">{g.name}</p><p className="text-xs text-slate-400" dir="ltr">{g.key}</p></div>
                <span className={`badge mr-auto ${g.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{g.isActive ? "فعال" : "غیرفعال"}</span>
              </div>
              <ActionForm action={saveGateway} className="space-y-3" success="تنظیمات درگاه ذخیره شد">
                <input type="hidden" name="id" value={g.id} />
                <div><label className="label">نام نمایشی</label><input name="name" defaultValue={g.name} className="input" /></div>
                <div><label className="label">توضیح</label><input name="description" defaultValue={g.description ?? ""} className="input" /></div>
                <div><label className="label">تنظیمات (JSON)</label><textarea name="config" rows={5} defaultValue={JSON.stringify(g.config, null, 2)} className="input font-mono text-xs" dir="ltr" /></div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={g.isActive} className="accent-brand-600" /> فعال</label>
                  <div className="flex items-center gap-2 text-sm">ترتیب <input name="sortOrder" type="number" defaultValue={g.sortOrder} className="input w-16 py-1" dir="ltr" /></div>
                </div>
                <button className="btn-primary w-full">ذخیره</button>
              </ActionForm>
            </div>
          );
        })}
      </div>
    </div>
  );
}
