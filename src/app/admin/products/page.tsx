import Link from "next/link";
import { Plus } from "lucide-react";
import { getAdminProducts } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatNumber, formatPrice } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/ProductRowActions";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  if (!hasPermission(await getCurrentUser(), "products")) redirect("/admin");
  const list = await getAdminProducts();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">محصولات <span className="text-sm font-normal text-slate-500">({formatNumber(list.length)})</span></h1>
        <Link href="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> محصول جدید</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>محصول</th><th>برند / دسته</th><th>قیمت</th><th>موجودی</th><th>فروش</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td>
                  <div className="flex items-center gap-3">
                    <img src={p.image ?? "/images/hero.jpg"} alt={p.name} width={44} height={44} loading="lazy" className="h-11 w-11 rounded-lg object-cover" />
                    <div><Link href={`/admin/products/${p.id}`} className="font-medium hover:text-brand-600">{p.name}</Link><p className="text-xs text-slate-400" dir="ltr">/{p.slug}</p></div>
                  </div>
                </td>
                <td className="text-slate-500">{p.brandName} / {p.categoryName}</td>
                <td>{formatPrice(p.basePrice)}{p.discountPercent > 0 && <span className="badge mr-1 bg-rose-500/15 text-rose-600">{p.discountPercent}٪</span>}</td>
                <td><span className={`font-semibold ${p.stock < 5 ? "text-rose-500" : ""}`}>{formatNumber(p.stock)}</span></td>
                <td>{formatNumber(p.salesCount)}</td>
                <td><ProductRowActions id={p.id} isActive={p.isActive} isFeatured={p.isFeatured} /></td>
                <td><Link href={`/admin/products/${p.id}`} className="btn-secondary h-8 px-3 text-xs">ویرایش</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
