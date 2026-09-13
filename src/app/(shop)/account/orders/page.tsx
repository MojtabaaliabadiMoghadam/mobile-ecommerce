import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/data";
import { formatDateShort, formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABEL } from "@/lib/utils";
import type { OrderStatus } from "@/db/schema";

export const metadata: Metadata = { title: "سفارش‌های من", robots: { index: false } };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const user = (await getCurrentUser())!;
  const all = await getUserOrders(user.id);
  const orders = status ? all.filter((o) => o.status === status) : all;
  const tabs: { k: string; l: string }[] = [{ k: "", l: "همه" }, ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((k) => ({ k, l: ORDER_STATUS[k].label }))];
  return (
    <div>
      <h1 className="text-2xl font-extrabold">سفارش‌های من</h1>
      <div className="mt-4 flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <Link key={t.k} href={t.k ? `/account/orders?status=${t.k}` : "/account/orders"} className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${(status ?? "") === t.k ? "bg-brand-600 text-white" : "card hover:border-brand-400"}`}>
            {t.l} ({new Intl.NumberFormat("fa-IR").format(t.k ? all.filter((o) => o.status === t.k).length : all.length)})
          </Link>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {orders.length === 0 && <p className="card py-12 text-center text-sm text-slate-500">سفارشی یافت نشد</p>}
        {orders.map((o) => (
          <Link key={o.id} href={`/account/orders/${o.id}`} className="card block p-4 transition hover:border-brand-400">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="font-bold" dir="ltr">{o.orderNumber}</span>
              <span className="text-xs text-slate-500">{formatDateShort(o.createdAt)}</span>
              <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
              <span className="mr-auto font-bold">{formatPrice(o.total)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {o.items.map((it) => <img key={it.id} src={it.image ?? "/images/hero.jpg"} alt={it.productName} width={56} height={56} loading="lazy" className="h-14 w-14 rounded-xl border border-slate-100 object-cover dark:border-slate-800" />)}
              <div className="mr-2 text-xs text-slate-500">
                <p>{o.items.map((i) => `${i.productName} ×${i.quantity}`).join("، ")}</p>
                <p className="mt-1">{PAYMENT_METHOD_LABEL[o.paymentMethod]}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
