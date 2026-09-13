"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import type { Address } from "@/db/schema";
import { deleteAddress, saveAddress } from "@/app/actions/shop";
import { useToast } from "@/components/ui/Toast";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [editing, setEditing] = useState<Address | null | "new">(null);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const a = editing === "new" ? null : editing;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((ad) => (
          <div key={ad.id} className="card p-4 text-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-bold"><MapPin className="h-4 w-4 text-brand-600" /> {ad.title} {ad.isDefault && <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">پیش‌فرض</span>}</p>
              <div className="flex gap-1">
                <button onClick={() => setEditing(ad)} className="btn-ghost h-8 w-8 p-0" aria-label="ویرایش"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => { if (confirm("حذف شود؟")) start(async () => { await deleteAddress(ad.id); router.refresh(); }); }} className="btn-ghost h-8 w-8 p-0 text-rose-500" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-2">{ad.receiverName} — <span dir="ltr">{ad.receiverPhone}</span></p>
            <p className="mt-1 text-xs leading-6 text-slate-500">{ad.province}، {ad.city}، {ad.line} — کد پستی {ad.postalCode}</p>
          </div>
        ))}
      </div>
      {editing === null ? (
        <button onClick={() => setEditing("new")} className="btn-primary"><Plus className="h-4 w-4" /> افزودن آدرس</button>
      ) : (
        <form
          key={a?.id ?? "new"}
          className="card grid gap-3 p-5 sm:grid-cols-2"
          action={(fd) =>
            start(async () => {
              const r = await saveAddress(fd);
              if (r?.error) return toast(r.error, "error");
              toast("آدرس ذخیره شد");
              setEditing(null);
              router.refresh();
            })
          }
        >
          <input type="hidden" name="id" value={a?.id ?? ""} />
          <div><label className="label">عنوان</label><input name="title" defaultValue={a?.title ?? ""} placeholder="خانه / محل کار" className="input" /></div>
          <div><label className="label">نام گیرنده *</label><input name="receiverName" required defaultValue={a?.receiverName ?? ""} className="input" /></div>
          <div><label className="label">موبایل گیرنده *</label><input name="receiverPhone" required defaultValue={a?.receiverPhone ?? ""} className="input" dir="ltr" /></div>
          <div><label className="label">کد پستی *</label><input name="postalCode" required defaultValue={a?.postalCode ?? ""} className="input" dir="ltr" /></div>
          <div><label className="label">استان *</label><input name="province" required defaultValue={a?.province ?? ""} className="input" /></div>
          <div><label className="label">شهر *</label><input name="city" required defaultValue={a?.city ?? ""} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">آدرس کامل *</label><textarea name="line" required rows={2} defaultValue={a?.line ?? ""} className="input" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDefault" defaultChecked={a?.isDefault} className="accent-brand-600" /> آدرس پیش‌فرض</label>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={pending} className="btn-primary">ذخیره</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost">انصراف</button>
          </div>
        </form>
      )}
    </div>
  );
}
