import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminOrders } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort, formatNumber, formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/utils";
import type { OrderStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  if (!hasPermission(await getCurrentUser(), "orders")) redirect("/admin");
  const { status } = await searchParams;
  const list = await getAdminOrders(status);
  const tabs = [{ k: "", l: "همه" }, ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((k) => ({ k, l: ORDER_STATUS[k].label }))];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">سفارشات <span className="text-sm font-normal text-slate-500">({formatNumber(list.length)})</span></h1>
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <Link key={t.k} href={t.k ? `/admin/orders?status=${t.k}` : "/admin/orders"} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${(status ?? "") === t.k ? "bg-brand-600 text-white" : "card"}`}>{t.l}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>شماره</th><th>مشتری</th><th>اقلام</th><th>تاریخ</th><th>پرداخت</th><th>وضعیت</th><th>مبلغ</th><th></th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="font-medium" dir="ltr">{o.orderNumber}</td>
                <td><p>{o.user?.name ?? "—"}</p><p className="text-xs text-slate-400" dir="ltr">{o.user?.email}</p></td>
                <td className="max-w-56 truncate text-slate-500">{o.items.map((i) => `${i.productName} ×${i.quantity}`).join("، ")}</td>
                <td className="text-slate-500">{formatDateShort(o.createdAt)}</td>
                <td><p className="text-xs">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</p><p className={`text-xs ${o.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</p></td>
                <td><span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span></td>
                <td className="font-semibold">{formatPrice(o.total)}</td>
                <td><Link href={`/admin/orders/${o.id}`} className="btn-secondary h-8 px-3 text-xs">جزئیات</Link></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-slate-500">سفارشی یافت نشد</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
