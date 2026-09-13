import { redirect } from "next/navigation";
import { getAdminMedia } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { formatDateShort, formatNumber } from "@/lib/utils";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const user = await getCurrentUser();
  if (!hasPermission(user, "content") && !hasPermission(user, "products")) redirect("/admin");
  const items = await getAdminMedia();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">مدیریت تصاویر (مدیا گالری)</h1>
        <span className="text-sm text-slate-500">{formatNumber(items.length)} تصویر</span>
      </div>
      <p className="text-sm text-slate-500">
        تصاویر آپلودشده در اینجا ذخیره می‌شوند و می‌توانید آدرس آن‌ها را در بنرها، محصولات و مقالات استفاده کنید — بدون هاردکد کردن آدرس.
      </p>
      <MediaLibrary initialItems={items} />
    </div>
  );
}
