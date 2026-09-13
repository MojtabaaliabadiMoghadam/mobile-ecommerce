import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, Crown, ArrowLeft, Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders, getUserWishlistIds } from "@/lib/data";
import { formatDateShort, formatNumber, formatPrice, ORDER_STATUS, TIERS, nextTier } from "@/lib/utils";

export const metadata: Metadata = { title: "داشبورد کاربری", robots: { index: false } };

export default async function AccountDashboard() {
  const user = (await getCurrentUser())!;
  const [orders, wish] = await Promise.all([getUserOrders(user.id), getUserWishlistIds(user.id)]);
  const nt = nextTier(user.loyaltyTier);
  const progress = nt ? Math.min(100, Math.round((user.loyaltyPoints / TIERS[nt].min) * 100)) : 100;
  const active = orders.filter((o) => ["processing", "shipped", "pending_payment"].includes(o.status)).length;
  const stats = [
    { label: "کل سفارش‌ها", value: formatNumber(orders.length), icon: Package, href: "/account/orders" },
    { label: "سفارش‌های جاری", value: formatNumber(active), icon: Package, href: "/account/orders" },
    { label: "علاقه‌مندی‌ها", value: formatNumber(wish.length), icon: Heart, href: "/account/wishlist" },
    { label: "امتیاز باشگاه", value: formatNumber(user.loyaltyPoints), icon: Star, href: "/account/loyalty" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">سلام {user.name} 👋</h1>
        <p className="text-sm text-slate-500">به پنل کاربری خود خوش آمدید</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 transition hover:border-brand-400">
            <s.icon className="h-5 w-5 text-brand-600" />
            <p className="mt-3 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </Link>
        ))}
      </div>
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold"><Crown className="h-5 w-5 text-amber-500" /> سطح {TIERS[user.loyaltyTier].label}</h2>
          <Link href="/account/loyalty" className="text-xs text-brand-600">جزئیات</Link>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-brand-600 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {nt ? `${formatNumber(TIERS[nt].min - user.loyaltyPoints)} امتیاز تا سطح ${TIERS[nt].label}` : "شما در بالاترین سطح باشگاه هستید 🎉"}
        </p>
      </div>
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">آخرین سفارش‌ها</h2>
          <Link href="/account/orders" className="flex items-center gap-1 text-xs text-brand-600">همه <ArrowLeft className="h-3 w-3" /></Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {orders.slice(0, 4).map((o) => (
            <Link key={o.id} href={`/account/orders/${o.id}`} className="flex items-center gap-3 py-3 text-sm hover:text-brand-600">
              <div className="flex -space-x-3 space-x-reverse">
                {o.items.slice(0, 3).map((it) => <img key={it.id} src={it.image ?? "/images/hero.jpg"} alt={it.productName} width={40} height={40} loading="lazy" className="h-10 w-10 rounded-lg border-2 border-white object-cover dark:border-slate-900" />)}
              </div>
              <div className="flex-1">
                <p className="font-medium" dir="ltr">{o.orderNumber}</p>
                <p className="text-xs text-slate-500">{formatDateShort(o.createdAt)}</p>
              </div>
              <span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span>
              <span className="hidden font-semibold sm:inline">{formatPrice(o.total)}</span>
            </Link>
          ))}
          {orders.length === 0 && <p className="py-6 text-center text-sm text-slate-500">هنوز سفارشی ثبت نکرده‌اید</p>}
        </div>
      </div>
    </div>
  );
}
