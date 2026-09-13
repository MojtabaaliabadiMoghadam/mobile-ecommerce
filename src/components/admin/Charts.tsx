"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

const fa = (n: number) => new Intl.NumberFormat("fa-IR").format(n);
const short = (n: number) => (n >= 1_000_000 ? `${fa(Math.round(n / 1_000_000))}M` : fa(n));

export function RevenueChart({ data }: { data: { day: string; revenue: number; c: number }[] }) {
  const fmt = data.map((d) => ({ ...d, label: new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(d.day)) }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={fmt} margin={{ left: 0, right: 0, top: 10 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} reversed />
        <YAxis tickFormatter={short} tick={{ fontSize: 11 }} orientation="right" width={50} />
        <Tooltip formatter={(v) => [`${fa(Number(v))} تومان`, "فروش"]} contentStyle={{ borderRadius: 12, fontSize: 12, direction: "rtl" }} />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const COLORS: Record<string, string> = { pending_payment: "#f59e0b", processing: "#3b82f6", shipped: "#8b5cf6", delivered: "#10b981", cancelled: "#f43f5e" };
export function StatusPie({ data }: { data: { name: string; key: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((d) => <Cell key={d.key} fill={COLORS[d.key] ?? "#94a3b8"} />)}
        </Pie>
        <Tooltip formatter={(v) => [fa(Number(v)), "سفارش"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopProductsChart({ data }: { data: { name: string; salesCount: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} orientation="right" tickFormatter={(v: string) => v.replace("گوشی ", "").slice(0, 22)} />
        <Tooltip formatter={(v) => [fa(Number(v)), "فروش"]} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
        <Bar dataKey="salesCount" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
