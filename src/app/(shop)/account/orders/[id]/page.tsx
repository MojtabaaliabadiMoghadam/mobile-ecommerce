import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/data";
import { formatDate, formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL, SHIPPING_METHOD } from "@/lib/utils";
import { OrderTimeline } from "@/components/account/OrderTimeline";
import { CancelOrderButton } from "@/components/account/CancelOrderButton";

export const metadata: Metadata = { title: "جزئیات سفارش", robots: { index: false } };

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const o = await getOrderForUser(Number(id), user.id);
  if (!o) notFound();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">سفارش <span dir="ltr">{o.orderNumber}</span></h1>
        <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
        <span className="text-xs text-slate-500">{formatDate(o.createdAt)}</span>
      </div>
      <div className="card p-5">
        <h2 className="mb-6 font-bold">ردیابی سفارش</h2>
        <OrderTimeline status={o.status} history={o.history} />
        {o.trackingCode && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60">کد رهگیری مرسوله: <span className="font-bold" dir="ltr">{o.trackingCode}</span></p>}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-5 text-sm">
          <h2 className="mb-3 font-bold">اطلاعات پرداخت و ارسال</h2>
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-slate-500">روش پرداخت</dt><dd>{PAYMENT_METHOD_LABEL[o.paymentMethod]}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">وضعیت پرداخت</dt><dd>{PAYMENT_STATUS_LABEL[o.paymentStatus]}</dd></div>
            {o.paymentRef && <div className="flex justify-between"><dt className="text-slate-500">کد پیگیری</dt><dd dir="ltr">{o.paymentRef}</dd></div>}
            <div className="flex justify-between"><dt className="text-slate-500">روش ارسال</dt><dd>{SHIPPING_METHOD[o.shippingMethod].label}</dd></div>
            {o.couponCode && <div className="flex justify-between"><dt className="text-slate-500">کد تخفیف</dt><dd dir="ltr">{o.couponCode}</dd></div>}
            {o.pointsEarned > 0 && <div className="flex justify-between"><dt className="text-slate-500">امتیاز کسب‌شده</dt><dd>{new Intl.NumberFormat("fa-IR").format(o.pointsEarned)}</dd></div>}
          </dl>
        </div>
        <div className="card p-5 text-sm">
          <h2 className="mb-3 font-bold">آدرس تحویل</h2>
          {o.shippingAddress && (
            <>
              <p className="font-semibold">{o.shippingAddress.receiverName} — <span dir="ltr">{o.shippingAddress.receiverPhone}</span></p>
              <p className="mt-1 leading-6 text-slate-500">{o.shippingAddress.province}، {o.shippingAddress.city}، {o.shippingAddress.line}</p>
              <p className="text-slate-500">کد پستی: {o.shippingAddress.postalCode}</p>
            </>
          )}
          {o.note && <p className="mt-3 rounded-lg bg-slate-50 p-2 text-xs dark:bg-slate-800/60">یادداشت: {o.note}</p>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/60">
            <tr><th className="p-3 text-right">کالا</th><th className="p-3">تعداد</th><th className="p-3">قیمت واحد</th><th className="p-3">جمع</th></tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={it.image ?? "/images/hero.jpg"} alt={it.productName} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                    <div><p className="font-medium">{it.productName}</p><p className="text-xs text-slate-500">{it.variantLabel}</p></div>
                  </div>
                </td>
                <td className="p-3 text-center">{new Intl.NumberFormat("fa-IR").format(it.quantity)}</td>
                <td className="p-3 text-center">{formatPrice(it.unitPrice)}</td>
                <td className="p-3 text-center font-semibold">{formatPrice(it.unitPrice * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1 border-t border-slate-100 p-4 text-sm dark:border-slate-800">
          <div className="flex justify-between"><span className="text-slate-500">جمع کالاها</span><span>{formatPrice(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="flex justify-between text-emerald-600"><span>تخفیف</span><span>− {formatPrice(o.discount)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">ارسال</span><span>{o.shippingCost ? formatPrice(o.shippingCost) : "رایگان"}</span></div>
          <div className="flex justify-between border-t border-dashed pt-2 font-extrabold dark:border-slate-700"><span>مبلغ کل</span><span>{formatPrice(o.total)}</span></div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {o.status === "pending_payment" && o.paymentMethod === "zarinpal" && <a href={`/api/payment/zarinpal/request?order=${o.orderNumber}`} className="btn-primary">پرداخت سفارش</a>}
        {o.status === "pending_payment" && <CancelOrderButton orderId={o.id} />}
        <Link href="/account/orders" className="btn-ghost">بازگشت</Link>
      </div>
    </div>
  );
}
