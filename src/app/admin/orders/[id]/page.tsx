import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAdminOrder } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDate, formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, SHIPPING_METHOD } from "@/lib/utils";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { ActionForm } from "@/components/admin/ActionForm";
import { Select } from "@/components/ui/Select";
import { updateOrderStatus } from "@/app/actions/admin";
import type { OrderStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  if (!hasPermission(await getCurrentUser(), "orders")) redirect("/admin");
  const { id } = await params;
  const o = await getAdminOrder(Number(id));
  if (!o) notFound();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/orders" className="btn-ghost text-xs">← سفارشات</Link>
        <h1 className="text-2xl font-extrabold" dir="ltr">{o.orderNumber}</h1>
        <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
        <span className="text-xs text-slate-500">{formatDate(o.createdAt)}</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h2 className="mb-6 font-bold">وضعیت سفارش</h2>
            <OrderTimeline status={o.status} history={o.history} />
          </div>
          <div className="card overflow-hidden">
            <table className="table-admin">
              <thead><tr><th>کالا</th><th>تنوع</th><th>تعداد</th><th>قیمت</th></tr></thead>
              <tbody>
                {o.items.map((it) => (
                  <tr key={it.id}>
                    <td><div className="flex items-center gap-2"><img src={it.image ?? "/images/hero.jpg"} alt={it.productName} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />{it.productName}</div></td>
                    <td className="text-slate-500">{it.variantLabel}</td>
                    <td>{it.quantity}</td>
                    <td>{formatPrice(it.unitPrice * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="space-y-1 border-t border-slate-100 p-4 text-sm dark:border-slate-800">
              <div className="flex justify-between"><span className="text-slate-500">جمع کالاها</span><span>{formatPrice(o.subtotal)}</span></div>
              {o.discount > 0 && <div className="flex justify-between text-emerald-600"><span>تخفیف {o.couponCode && `(${o.couponCode})`}</span><span>− {formatPrice(o.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-500">ارسال ({SHIPPING_METHOD[o.shippingMethod].label})</span><span>{o.shippingCost ? formatPrice(o.shippingCost) : "رایگان"}</span></div>
              <div className="flex justify-between border-t pt-2 font-extrabold dark:border-slate-700"><span>جمع کل</span><span>{formatPrice(o.total)}</span></div>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-3 font-bold">تغییر وضعیت</h2>
            <ActionForm action={updateOrderStatus} className="space-y-3" success="وضعیت سفارش به‌روزرسانی شد">
              <input type="hidden" name="id" value={o.id} />
              <div><label className="label">وضعیت جدید</label>
                <Select name="status" defaultValue={o.status} label="وضعیت جدید" options={(Object.keys(ORDER_STATUS) as OrderStatus[]).map((k) => ({ value: k, label: ORDER_STATUS[k].label }))} />
              </div>
              <div><label className="label">کد رهگیری پستی</label><input name="trackingCode" defaultValue={o.trackingCode ?? ""} className="input" dir="ltr" /></div>
              <div><label className="label">یادداشت</label><input name="note" className="input" placeholder="نمایش داده می‌شود به مشتری" /></div>
              <button className="btn-primary w-full">ثبت</button>
            </ActionForm>
          </div>
          <div className="card p-5 text-sm">
            <h2 className="mb-3 font-bold">مشتری</h2>
            <p className="font-semibold">{o.user?.name}</p>
            <p className="text-slate-500" dir="ltr">{o.user?.email}</p>
            <p className="text-slate-500" dir="ltr">{o.user?.phone}</p>
            <h3 className="mt-4 mb-1 font-semibold">آدرس تحویل</h3>
            {o.shippingAddress && <p className="text-xs leading-6 text-slate-500">{o.shippingAddress.receiverName} — {o.shippingAddress.receiverPhone}<br />{o.shippingAddress.province}، {o.shippingAddress.city}، {o.shippingAddress.line}<br />کد پستی {o.shippingAddress.postalCode}</p>}
            <h3 className="mt-4 mb-1 font-semibold">پرداخت</h3>
            <p className="text-xs text-slate-500">{PAYMENT_METHOD_LABEL[o.paymentMethod]} — {PAYMENT_STATUS_LABEL[o.paymentStatus]}{o.paymentRef && <> — <span dir="ltr">{o.paymentRef}</span></>}</p>
            {o.note && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20">یادداشت مشتری: {o.note}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
