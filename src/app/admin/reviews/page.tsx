import Link from "next/link";
import { redirect } from "next/navigation";
import { Trash2, Check, EyeOff } from "lucide-react";
import { getAllReviews } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort } from "@/lib/utils";
import { Rating } from "@/components/ui/Rating";
import { ActionButton } from "@/components/admin/ActionForm";
import { deleteReview, toggleReview } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  if (!hasPermission(await getCurrentUser(), "products")) redirect("/admin");
  const list = await getAllReviews();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">نظرات کاربران</h1>
      <div className="card overflow-x-auto">
        <table className="table-admin">
          <thead><tr><th>محصول</th><th>کاربر</th><th>امتیاز</th><th>نظر</th><th>تاریخ</th><th>وضعیت</th><th></th></tr></thead>
          <tbody>
            {list.map(({ review: r, productName, productSlug }) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td><Link href={`/product/${productSlug}#reviews`} className="text-brand-600 hover:underline">{productName}</Link></td>
                <td>{r.authorName}</td>
                <td><Rating value={r.rating} /></td>
                <td className="max-w-md whitespace-normal text-xs text-slate-500"><span className="font-semibold text-slate-700 dark:text-slate-200">{r.title}</span> — {r.body}</td>
                <td className="text-slate-500">{formatDateShort(r.createdAt)}</td>
                <td><span className={`badge ${r.isApproved ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>{r.isApproved ? "تأیید شده" : "مخفی"}</span></td>
                <td>
                  <div className="flex items-center gap-1">
                    <ActionButton action={toggleReview.bind(null, r.id, !r.isApproved)} confirmText={null} className="btn-ghost h-8 w-8 p-0">{r.isApproved ? <EyeOff className="h-4 w-4" /> : <Check className="h-4 w-4 text-emerald-600" />}</ActionButton>
                    <ActionButton action={deleteReview.bind(null, r.id)}><Trash2 className="h-4 w-4" /></ActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
