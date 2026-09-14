"use client";
import { useSyncExternalStore } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
const short = (n: number) => (n >= 1_000_000 ? `${fa(Math.round(n / 1_000_000))}M` : fa(n));

/**
 * تشخیص سایز موبایل بدون خطای Hydration (SSR-safe).
 * روی سرور همیشه false برمی‌گردد (خروجی دسکتاپ دقیقاً مثل قبل می‌ماند).
 */
function useIsMobile(breakpoint = 640): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(`(max-width: ${breakpoint - 0.02}px)`).matches,
    () => false
  );
}

export function RevenueChart({ data }: { data: { day: string; revenue: number; c: number }[] }) {
  const isMobile = useIsMobile();
  const fmt = data.map((d) => ({ ...d, label: new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(d.day)) }));
  // روی موبایل برچسب محور X محدود می‌شود (حدود ۵ عدد) تا روی هم نیفتند؛ روی دسکتاپ رفتار قبلی (همه برچسب‌ها)
  const tickInterval = isMobile ? Math.max(0, Math.ceil(fmt.length / 5) - 1) : undefined;
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
      <AreaChart data={fmt} margin={{ left: 0, right: 0, top: 10, bottom: isMobile ? 5 : 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="label" tick={{ fontSize: isMobile ? 10 : 11 }} reversed interval={tickInterval} tickMargin={isMobile ? 6 : undefined} />
        <YAxis tickFormatter={short} tick={{ fontSize: isMobile ? 10 : 11 }} orientation="right" width={isMobile ? 38 : 50} />
        <Tooltip formatter={(v) => [`${fa(Number(v))} تومان`, "فروش"]} contentStyle={{ borderRadius: 12, fontSize: 12, direction: "rtl" }} />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const COLORS: Record<string, string> = { pending_payment: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#f43f5e" };
export function StatusPie({ data }: { data: { name: string; key: string; value: number }[] }) {
  const isMobile = useIsMobile();
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 210 : 260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={isMobile ? 36 : 55} outerRadius={isMobile ? 58 : 90} paddingAngle={3}>
          {data.map((d) => <Cell key={d.key} fill={COLORS[d.key] ?? "#94a3b8"} />)}
        </Pie>
        <Tooltip formatter={(v) => [fa(Number(v)), "سفارش"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 12, paddingTop: isMobile ? 4 : 0 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; salesCount: number }[] }) {
  const isMobile = useIsMobile();
  // روی موبایل نام طولانی محصولات کوتاه‌تر می‌شود تا چارت فشرده نشود؛ روی دسکتاپ همان ۲۲ کاراکتر قبلی
  const fmtName = (v: string) => {
    const s = v.replace("گوشی ", "");
    return isMobile && s.length > 12 ? `${s.slice(0, 12)}…` : s.slice(0, 22);
  };
  return (
    <ResponsiveContainer width="100%" height={isMobile ? 220 : 260}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: isMobile ? 4 : 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 11 }} />
        <YAxis type="category" dataKey="name" width={isMobile ? 96 : 150} tick={{ fontSize: 10 }} orientation="right" tickFormatter={fmtName} />
        <Tooltip formatter={(v) => [fa(Number(v)), "فروش"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Bar dataKey="salesCount" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
