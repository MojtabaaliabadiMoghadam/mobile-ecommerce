"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProduct, toggleProductFlag } from "@/app/actions/admin";

export function ProductRowActions({ id, isActive, isFeatured }: { id: number; isActive: boolean; isFeatured: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const Toggle = ({ on, label, field }: { on: boolean; label: string; field: "isActive" | "isFeatured" }) => (
    <button disabled={pending} onClick={() => start(async () => { await toggleProductFlag(id, field, !on); router.refresh(); })} className={`badge cursor-pointer transition ${on ? "bg-emerald-500/15 text-emerald-600" : "bg-slate-200 text-slate-500 dark:bg-slate-700"}`}>{label}</button>
  );
  return (
    <div className="flex items-center gap-1.5">
      <Toggle on={isActive} label={isActive ? "فعال" : "غیرفعال"} field="isActive" />
      <Toggle on={isFeatured} label="ویژه" field="isFeatured" />
      <button disabled={pending} onClick={() => { if (confirm("محصول حذف شود؟")) start(async () => { await deleteProduct(id); router.refresh(); }); }} className="btn-ghost h-7 w-7 p-0 text-rose-500" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}
