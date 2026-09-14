import type { Metadata } from "next";
import { Crown, Gift, Star, Copy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserLoyalty } from "@/lib/data";
import { formatDate, formatNumber, nextTier, TIERS, type Tier } from "@/lib/utils";

export const metadata: Metadata = { title: "باشگاه مشتریان", robots: { index: false } };

export default async function LoyaltyPage() {
  const user = (await getCurrentUser())!;
  const { transactions, personalCoupons } = await getUserLoyalty(user.id);
  const nt = nextTier(user.loyaltyTier);
  const progress = nt ? Math.min(100, Math.round((user.loyaltyPoints / TIERS[nt].min) * 100)) : 100;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">باشگاه مشتریان</h1>
      <div className={`card overflow-hidden bg-gradient-to-l ${TIERS[user.loyaltyTier].color} p-5 text-white sm:p-6`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm opacity-80">سطح فعلی شما</p>
            <p className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl"><Crown className="h-6 w-6 shrink-0 sm:h-8 sm:w-8" /> {TIERS[user.loyaltyTier].label}</p>
          </div>
          <div className="shrink-0 text-left">
            <p className="text-sm opacity-80">امتیاز</p>
            <p className="text-2xl font-extrabold sm:text-3xl">{formatNumber(user.loyaltyPoints)}</p>
          </div>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/30"><div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-xs opacity-90">{nt ? `${formatNumber(TIERS[nt].min - user.loyaltyPoints)} امتیاز تا سطح ${TIERS[nt].label}` : "شما در بالاترین سطح هستید"}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(TIERS) as Tier[]).map((t) => (
          <div key={t} className={`card p-4 ${t === user.loyaltyTier ? "border-brand-500 ring-2 ring-brand-500/20" : ""}`}>
            <p className="font-bold">{TIERS[t].label}</p>
            <p className="text-xs text-slate-500">از {formatNumber(TIERS[t].min)} امتیاز</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <li>• تخفیف خودکار {TIERS[t].discount}٪ روی هر خرید</li>
              <li>• ضریب امتیاز ×{TIERS[t].multiplier}</li>
              {t !== "bronze" && <li>• کد تخفیف اختصاصی</li>}
              {t === "gold" && <li>• ارسال اولویت‌دار</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Gift className="h-5 w-5 text-rose-500" /> کدهای تخفیف اختصاصی شما</h2>
        {personalCoupons.length === 0 ? (
          <p className="text-sm text-slate-500">با رسیدن به سطح نقره‌ای کد تخفیف اختصاصی دریافت می‌کنید.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {personalCoupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-brand-400 bg-brand-50/50 p-3 dark:bg-brand-900/20">
                <div className="min-w-0">
                  <p className="break-all font-mono text-base font-bold sm:text-lg" dir="ltr">{c.code}</p>
                  <p className="text-xs text-slate-500">{c.type === "percent" ? `${c.value}٪ تخفیف` : `${formatNumber(c.value)} تومان تخفیف`}{c.maxDiscount ? ` (تا سقف ${formatNumber(c.maxDiscount)} تومان)` : ""}</p>
                </div>
                <Copy className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><Star className="h-5 w-5 text-amber-500" /> تاریخچه امتیازات</h2>
        <div className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0"><p className="break-words">{t.reason}</p><p className="text-xs text-slate-400">{formatDate(t.createdAt)}</p></div>
              <span className={`shrink-0 font-bold ${t.points >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{t.points >= 0 ? "+" : ""}{formatNumber(t.points)}</span>
            </div>
          ))}
          {transactions.length === 0 && <p className="py-6 text-center text-slate-500">هنوز تراکنشی ثبت نشده</p>}
        </div>
      </div>
    </div>
  );
}
