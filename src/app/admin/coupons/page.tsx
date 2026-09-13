import { redirect } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { getAdminCoupons, getAdminUsers } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort, formatNumber } from "@/lib/utils";
import { EditorModal } from "@/components/admin/EditorModal";
import { ActionButton } from "@/components/admin/ActionForm";
import { deleteCoupon, saveCoupon } from "@/app/actions/admin";
import type { Coupon } from "@/db/schema";

export const dynamic = "force-dynamic";

function Fields({ c, users }: { c?: Coupon; users: { id: number; name: string; email: string }[] }) {
  return (
    <>
      <input type="hidden" name="id" value={c?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">کد *</label><input name="code" required defaultValue={c?.code} className="input uppercase" dir="ltr" /></div>
        <div><label className="label">نوع</label><select name="type" defaultValue={c?.type ?? "percent"} className="input"><option value="percent">درصدی</option><option value="fixed">مبلغ ثابت (تومان)</option></select></div>
        <div><label className="label">مقدار *</label><input name="value" type="number" required defaultValue={c?.value} className="input" dir="ltr" /></div>
        <div><label className="label">سقف تخفیف (تومان)</label><input name="maxDiscount" type="number" defaultValue={c?.maxDiscount ?? ""} className="input" dir="ltr" /></div>
        <div><label className="label">حداقل سفارش (تومان)</label><input name="minOrder" type="number" defaultValue={c?.minOrder ?? 0} className="input" dir="ltr" /></div>
        <div><label className="label">سقف استفاده</label><input name="usageLimit" type="number" defaultValue={c?.usageLimit ?? ""} className="input" dir="ltr" /></div>
        <div><label className="label">تاریخ انقضا</label><input name="expiresAt" type="date" defaultValue={c?.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : ""} className="input" dir="ltr" /></div>
        <div><label className="label">اختصاصی برای کاربر</label>
          <select name="userId" defaultValue={c?.userId ?? ""} className="input"><option value="">عمومی</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={c?.isActive ?? true} className="accent-brand-600" /> فعال</label>
      </div>
    </>
  );
}

export default async function AdminCoupons() {
  if (!hasPermission(await getCurrentUser(), "coupons")) redirect("/admin");
  const [list, users] = await Promise.all([getAdminCoupons(), getAdminUsers()]);
  const us = users.map((u) => ({ id: u.id, name: u.name, email: u.email }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">کدهای تخفیف</h1>
        <EditorModal title="کد تخفیف جدید" action={saveCoupon} triggerClass="btn-primary" trigger={<><Plus className="h-4 w-4" /> کد جدید</>}><Fields users={us} /></EditorModal>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>کد</th><th>تخفیف</th><th>حداقل سفارش</th><th>استفاده</th><th>اختصاصی</th><th>انقضا</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map(({ coupon: c, userName }) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="font-mono font-bold" dir="ltr">{c.code}</td>
                <td>{c.type === "percent" ? `${c.value}٪` : `${formatNumber(c.value)} تومان`}{c.maxDiscount ? <span className="text-xs text-slate-400"> (تا {formatNumber(c.maxDiscount)})</span> : null}</td>
                <td>{c.minOrder ? formatNumber(c.minOrder) : "—"}</td>
                <td>{formatNumber(c.usedCount)}{c.usageLimit ? ` / ${formatNumber(c.usageLimit)}` : ""}</td>
                <td>{userName ?? <span className="text-slate-400">عمومی</span>}</td>
                <td>{c.expiresAt ? formatDateShort(c.expiresAt) : "—"}</td>
                <td><span className={`badge ${c.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{c.isActive ? "فعال" : "غیرفعال"}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <EditorModal title={`ویرایش ${c.code}`} action={saveCoupon} trigger={<Pencil className="h-3.5 w-3.5" />} triggerClass="btn-ghost h-8 w-8 p-0"><Fields c={c} users={us} /></EditorModal>
                    <ActionButton action={deleteCoupon.bind(null, c.id)}><Trash2 className="h-4 w-4" /></ActionButton>
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
