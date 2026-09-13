import { redirect } from "next/navigation";
import { Plus, Trash2, Pencil } from "lucide-react";
import { getAdminUsers } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { ALL_PERMISSIONS, formatDateShort, formatNumber, formatPrice, ROLE_LABEL, TIERS } from "@/lib/utils";
import { EditorModal } from "@/components/admin/EditorModal";
import { ActionButton } from "@/components/admin/ActionForm";
import { deleteUser, saveUser } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

type U = Awaited<ReturnType<typeof getAdminUsers>>[number];

function UserFields({ u }: { u?: U }) {
  return (
    <>
      <input type="hidden" name="id" value={u?.id ?? ""} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">نام *</label><input name="name" required defaultValue={u?.name} className="input" /></div>
        <div><label className="label">ایمیل *</label><input name="email" type="email" required defaultValue={u?.email} className="input" dir="ltr" /></div>
        <div><label className="label">موبایل</label><input name="phone" defaultValue={u?.phone ?? ""} className="input" dir="ltr" /></div>
        <div><label className="label">{u ? "رمز عبور جدید (اختیاری)" : "رمز عبور *"}</label><input name="password" type="password" className="input" dir="ltr" /></div>
        <div><label className="label">نقش</label>
          <select name="role" defaultValue={u?.role ?? "customer"} className="input">{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        </div>
        <div><label className="label">امتیاز باشگاه</label><input name="loyaltyPoints" type="number" defaultValue={u?.loyaltyPoints ?? 0} className="input" dir="ltr" /></div>
        <div><label className="label">کد تخفیف اختصاصی</label><input name="personalCoupon" defaultValue={u?.personalCoupon ?? ""} className="input" dir="ltr" /></div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={u?.isActive ?? true} className="accent-brand-600" /> حساب فعال</label>
      </div>
      <div>
        <p className="label">دسترسی‌های پنل مدیریت (برای نقش مدیر فروشگاه / پشتیبانی)</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ALL_PERMISSIONS.map((p) => (
            <label key={p.key} className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700"><input type="checkbox" name="permissions" value={p.key} defaultChecked={u?.permissions.includes(p.key)} className="accent-brand-600" /> {p.label}</label>
          ))}
        </div>
      </div>
    </>
  );
}

export default async function AdminUsers() {
  if (!hasPermission(await getCurrentUser(), "users")) redirect("/admin");
  const list = await getAdminUsers();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">کاربران و باشگاه مشتریان <span className="text-sm font-normal text-slate-500">({formatNumber(list.length)})</span></h1>
        <EditorModal title="کاربر جدید" action={saveUser} triggerClass="btn-primary" trigger={<><Plus className="h-4 w-4" /> کاربر جدید</>}><UserFields /></EditorModal>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>کاربر</th><th>نقش</th><th>سطح باشگاه</th><th>امتیاز</th><th>سفارش‌ها</th><th>مجموع خرید</th><th>عضویت</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td><p className="font-medium">{u.name}</p><p className="text-xs text-slate-400" dir="ltr">{u.email}</p></td>
                <td><span className={`badge ${u.role === "customer" ? "bg-slate-100 text-slate-600 dark:bg-slate-800" : "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"}`}>{ROLE_LABEL[u.role]}</span></td>
                <td><span className={`badge bg-gradient-to-l text-white ${TIERS[u.loyaltyTier].color}`}>{TIERS[u.loyaltyTier].label}</span></td>
                <td>{formatNumber(u.loyaltyPoints)}</td>
                <td>{formatNumber(u.orderCount)}</td>
                <td>{formatPrice(Number(u.spent))}</td>
                <td className="text-slate-500">{formatDateShort(u.createdAt)}</td>
                <td><span className={`badge ${u.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"}`}>{u.isActive ? "فعال" : "غیرفعال"}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <EditorModal title={`ویرایش ${u.name}`} action={saveUser} trigger={<Pencil className="h-3.5 w-3.5" />} triggerClass="btn-ghost h-8 w-8 p-0"><UserFields u={u} /></EditorModal>
                    <ActionButton action={deleteUser.bind(null, u.id)} confirmText="کاربر حذف شود؟"><Trash2 className="h-4 w-4" /></ActionButton>
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
