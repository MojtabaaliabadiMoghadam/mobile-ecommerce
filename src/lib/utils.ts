import type { OrderStatus } from "@/db/schema";

export const SITE_NAME = "اکسیر موبایل";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}
export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(d));
}
export function formatDateShort(d: Date | string): string {
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(d));
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const ORDER_STATUS: Record<OrderStatus, { label: string; color: string; step: number }> = {
  pending_payment: { label: "در انتظار پرداخت", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", step: 0 },
  processing: { label: "در حال پردازش", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", step: 1 },
  shipped: { label: "ارسال شده", color: "bg-violet-500/15 text-violet-600 dark:text-violet-400", step: 2 },
  delivered: { label: "تحویل شده", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", step: 3 },
  cancelled: { label: "لغو شده", color: "bg-rose-500/15 text-rose-600 dark:text-rose-400", step: -1 },
};
export const ORDER_STEPS: OrderStatus[] = ["pending_payment", "processing", "shipped", "delivered"];

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  zarinpal: "درگاه زرین‌پال",
  cod: "پرداخت در محل",
  in_store: "پرداخت حضوری در فروشگاه",
};
export const SHIPPING_METHOD: Record<string, { label: string; cost: number; eta: string }> = {
  post: { label: "پست پیشتاز", cost: 45000, eta: "۳ تا ۵ روز کاری" },
  express: { label: "پیک سریع (تهران)", cost: 90000, eta: "همان روز" },
  pickup: { label: "تحویل حضوری از فروشگاه", cost: 0, eta: "آماده تحویل" },
};
export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  unpaid: "پرداخت نشده",
  paid: "پرداخت شده",
  failed: "ناموفق",
  refunded: "مسترد شده",
};

export const TIERS = {
  bronze: { label: "برنزی", min: 0, discount: 0, color: "from-amber-700 to-amber-500", multiplier: 1 },
  silver: { label: "نقره‌ای", min: 2000, discount: 3, color: "from-slate-500 to-slate-300", multiplier: 1.5 },
  gold: { label: "طلایی", min: 6000, discount: 7, color: "from-yellow-500 to-amber-300", multiplier: 2 },
} as const;
export type Tier = keyof typeof TIERS;
export function tierForPoints(points: number): Tier {
  if (points >= TIERS.gold.min) return "gold";
  if (points >= TIERS.silver.min) return "silver";
  return "bronze";
}
export function nextTier(tier: Tier): Tier | null {
  return tier === "bronze" ? "silver" : tier === "silver" ? "gold" : null;
}

export const ROLE_LABEL: Record<string, string> = {
  customer: "مشتری",
  admin: "مدیر کل",
  manager: "مدیر فروشگاه",
  support: "پشتیبانی",
};

export const ALL_PERMISSIONS = [
  { key: "products", label: "مدیریت محصولات" },
  { key: "orders", label: "مدیریت سفارشات" },
  { key: "users", label: "مدیریت کاربران" },
  { key: "coupons", label: "مدیریت تخفیف‌ها" },
  { key: "content", label: "مدیریت محتوا و سئو" },
  { key: "payments", label: "درگاه‌های پرداخت" },
  { key: "settings", label: "تنظیمات" },
] as const;

export function slugify(s: string) {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function genOrderNumber() {
  const d = new Date();
  return `MC-${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;
}
