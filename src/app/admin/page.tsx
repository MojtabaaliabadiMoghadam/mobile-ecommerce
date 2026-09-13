import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle } from "lucide-react";
import { getAdminStats } from "@/lib/data";
import { formatDateShort, formatNumber, formatPrice, ORDER_STATUS } from "@/lib/utils";
import { RevenueChart, StatusPie, TopProductsChart } from "@/components/admin/Charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const st = await getAdminStats();
  const cards = [
    { label: "فروش کل", value: formatPrice(st.revenue), icon: DollarSign, color: "from-emerald-500 to-teal-500" },
    { label: "سفارشات", value: formatNumber(st.orderCount), icon: ShoppingCart, color: "from-brand-500 to-violet-500" },
    { label: "مشتریان", value: formatNumber(st.userCount), icon: Users, color: "from-amber-500 to-orange-500" },
    { label: "محصولات", value: formatNumber(st.productCount), icon: Package, color: "from-sky-500 to-blue-500" },
  ];
  const pie = st.statusRows.map((r) => ({ key: r.status, name: ORDER_STATUS[r.status].label, value: r.c }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">داشبورد</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card relative overflow-hidden p-5">
            <span className={`absolute -left-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${c.color} opacity-20`} />
            <c.icon className="h-5 w-5 text-slate-400" />
            <p className="mt-3 text-lg font-extrabold sm:text-xl">{c.value}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-bold">روند فروش (۹۰ روز اخیر)</h2>
          <RevenueChart data={st.daily} />
        </div>
        <div className="card p-5">
          <h2 className="mb-3 font-bold">وضعیت سفارشات</h2>
          <StatusPie data={pie} />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 font-bold">پرفروش‌ترین محصولات</h2>
          <TopProductsChart data={st.topProducts} />
        </div>
        <div className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-bold">آخرین سفارشات</h2>
            <Link href="/admin/orders" className="text-xs text-brand-600">همه سفارشات</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-admin">
              <thead><tr><th>شماره</th><th>مشتری</th><th>تاریخ</th><th>وضعیت</th><th>مبلغ</th></tr></thead>
              <tbody>
                {st.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td><Link href={`/admin/orders/${o.id}`} className="font-medium text-brand-600" dir="ltr">{o.orderNumber}</Link></td>
                    <td>{o.user?.name ?? "—"}</td>
                    <td className="text-slate-500">{formatDateShort(o.createdAt)}</td>
                    <td><span className={`badge ${ORDER_STATUS[o.status].color}`}>{ORDER_STATUS[o.status].label}</span></td>
                    <td className="font-semibold">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {st.lowStock.length > 0 && (
        <div className="card border-amber-300 p-5 dark:border-amber-700">
          <h2 className="mb-3 flex items-center gap-2 font-bold text-amber-600"><AlertTriangle className="h-5 w-5" /> موجودی کم</h2>
          <div className="flex flex-wrap gap-2">
            {st.lowStock.map((p) => (
              <Link key={p.slug} href={`/product/${p.slug}`} className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">{p.name} ({formatNumber(p.stock)})</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
