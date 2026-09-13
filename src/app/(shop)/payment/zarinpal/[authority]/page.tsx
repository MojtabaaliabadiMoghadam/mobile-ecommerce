import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { CreditCard, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "درگاه پرداخت زرین‌پال (شبیه‌سازی)", robots: { index: false } };

export default async function MockGateway({ params }: { params: Promise<{ authority: string }> }) {
  const { authority } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.paymentAuthority, authority));
  if (!o) notFound();
  const verify = `/api/payment/zarinpal/verify?Authority=${authority}`;
  return (
    <div className="container-x mt-10 flex justify-center">
      <div className="card w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-l from-yellow-400 to-amber-500 p-5 text-amber-950">
          <p className="flex items-center gap-2 text-lg font-extrabold"><CreditCard className="h-6 w-6" /> درگاه پرداخت زرین‌پال</p>
          <p className="text-xs opacity-80">محیط شبیه‌سازی‌شده (Sandbox) — هیچ تراکنش واقعی انجام نمی‌شود</p>
        </div>
        <div className="space-y-4 p-5 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">پذیرنده</span><span className="font-semibold">اکسیر موبایل</span></div>
          <div className="flex justify-between"><span className="text-slate-500">شماره سفارش</span><span dir="ltr">{o.orderNumber}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">شناسه پرداخت</span><span dir="ltr" className="text-xs">{authority}</span></div>
          <div className="flex justify-between text-base"><span className="text-slate-500">مبلغ</span><span className="font-extrabold">{formatPrice(o.total)}</span></div>
          <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700">
            <label className="label">شماره کارت</label>
            <input className="input" dir="ltr" placeholder="6037-99XX-XXXX-XXXX" defaultValue="6037 9975 1234 5678" />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><label className="label">CVV2</label><input className="input" dir="ltr" defaultValue="123" /></div>
              <div><label className="label">رمز دوم</label><input className="input" dir="ltr" type="password" defaultValue="123456" /></div>
            </div>
          </div>
          <div className="flex gap-2">
            <a href={`${verify}&Status=OK`} className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"><ShieldCheck className="h-4 w-4" /> پرداخت موفق</a>
            <a href={`${verify}&Status=NOK`} className="btn-danger flex-1">انصراف / ناموفق</a>
          </div>
        </div>
      </div>
    </div>
  );
}
