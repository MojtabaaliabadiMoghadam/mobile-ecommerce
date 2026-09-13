import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOrderByNumber } from "@/lib/data";
import { formatPrice, PAYMENT_METHOD_LABEL, SHIPPING_METHOD } from "@/lib/utils";

export const metadata: Metadata = { title: "نتیجه سفارش", robots: { index: false } };

export default async function OrderResult({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ status?: string }> }) {
  const [{ number }, { status }] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/order/${number}`);
  const o = await getOrderByNumber(number);
  if (!o || (o.userId !== user.id && user.role === "customer")) notFound();
  const failed = status === "failed" || o.paymentStatus === "failed";
  const pendingOnline = o.paymentMethod === "zarinpal" && o.status === "pending_payment";
  return (
    <div className="container-x mt-10 flex justify-center">
      <div className="card w-full max-w-lg animate-fade-up p-8 text-center">
        {failed ? (
          <>
            <XCircle className="mx-auto h-16 w-16 text-rose-500" />
            <h1 className="mt-4 text-xl font-extrabold">پرداخت ناموفق بود</h1>
            <p className="mt-2 text-sm text-slate-500">سفارش شما ثبت شده و می‌توانید تا ۱ ساعت آینده پرداخت را از پنل کاربری تکمیل کنید.</p>
          </>
        ) : pendingOnline ? (
          <>
            <Clock className="mx-auto h-16 w-16 text-amber-500" />
            <h1 className="mt-4 text-xl font-extrabold">در انتظار پرداخت</h1>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
            <h1 className="mt-4 text-xl font-extrabold">سفارش شما با موفقیت ثبت شد</h1>
            <p className="mt-2 text-sm text-slate-500">
              {o.paymentMethod === "in_store" ? "سفارش شما رزرو شد. لطفاً برای تحویل و پرداخت به فروشگاه مراجعه کنید." : o.paymentMethod === "cod" ? "مبلغ سفارش را هنگام تحویل پرداخت کنید." : "پرداخت با موفقیت انجام شد."}
            </p>
          </>
        )}
        <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-right text-sm dark:bg-slate-800/60">
          <div className="flex justify-between"><dt className="text-slate-500">شماره سفارش</dt><dd className="font-bold" dir="ltr">{o.orderNumber}</dd></div>
          {o.paymentRef && <div className="flex justify-between"><dt className="text-slate-500">کد پیگیری پرداخت</dt><dd dir="ltr">{o.paymentRef}</dd></div>}
          <div className="flex justify-between"><dt className="text-slate-500">روش پرداخت</dt><dd>{PAYMENT_METHOD_LABEL[o.paymentMethod]}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">روش ارسال</dt><dd>{SHIPPING_METHOD[o.shippingMethod].label}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">مبلغ</dt><dd className="font-bold">{formatPrice(o.total)}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {(failed || pendingOnline) && <a href={`/api/payment/zarinpal/request?order=${o.orderNumber}`} className="btn-primary">تلاش مجدد پرداخت</a>}
          <Link href={`/account/orders/${o.id}`} className="btn-secondary"><Package className="h-4 w-4" /> پیگیری سفارش</Link>
          <Link href="/products" className="btn-ghost">ادامه خرید</Link>
        </div>
      </div>
    </div>
  );
}
