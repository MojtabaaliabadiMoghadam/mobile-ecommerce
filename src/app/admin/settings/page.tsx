import { redirect } from "next/navigation";
import { getSettings } from "@/lib/data";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { ActionForm } from "@/components/admin/ActionForm";
import { saveSettings } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const fields: { key: string; label: string; textarea?: boolean; group: string; hint?: string }[] = [
  { key: "site_name", label: "نام سایت", group: "عمومی" },
  { key: "site_tagline", label: "شعار سایت", group: "عمومی" },
  { key: "announcement", label: "نوار اطلاع‌رسانی بالای سایت", group: "عمومی" },
  { key: "store_address", label: "آدرس فروشگاه حضوری", group: "عمومی" },
  { key: "store_phone", label: "تلفن فروشگاه", group: "عمومی" },
  { key: "meta_title", label: "Meta Title سراسری", group: "سئو", hint: "عنوان پیش‌فرض صفحات (حداکثر ۶۰ کاراکتر)" },
  { key: "meta_description", label: "Meta Description سراسری", group: "سئو", textarea: true, hint: "حداکثر ۱۶۰ کاراکتر" },
  { key: "meta_keywords", label: "کلمات کلیدی (با کاما)", group: "سئو" },
  { key: "free_shipping_threshold", label: "حد ارسال رایگان (تومان)", group: "فروش" },
  { key: "points_per_toman", label: "هر چند تومان = ۱ امتیاز", group: "فروش" },
];

export default async function AdminSettings() {
  if (!hasPermission(await getCurrentUser(), "settings")) redirect("/admin");
  const s = await getSettings();
  const groups = Array.from(new Set(fields.map((f) => f.group)));
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-extrabold">تنظیمات سایت و سئو</h1>
      <ActionForm action={saveSettings} className="space-y-5" success="تنظیمات ذخیره شد">
        {groups.map((g) => (
          <div key={g} className="card space-y-3 p-5">
            <h2 className="font-bold">{g}</h2>
            {fields.filter((f) => f.group === g).map((f) => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                {f.textarea ? <textarea name={f.key} rows={3} defaultValue={s[f.key] ?? ""} className="input" /> : <input name={f.key} defaultValue={s[f.key] ?? ""} className="input" />}
                {f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
              </div>
            ))}
          </div>
        ))}
        <div className="card p-5 text-sm">
          <h2 className="mb-2 font-bold">فایل‌های سئو</h2>
          <ul className="space-y-1 text-slate-500">
            <li>• نقشه سایت داینامیک: <a href="/sitemap.xml" target="_blank" className="text-brand-600" dir="ltr">/sitemap.xml</a></li>
            <li>• robots: <a href="/robots.txt" target="_blank" className="text-brand-600" dir="ltr">/robots.txt</a></li>
            <li>• Schema.org JSON-LD (Product / Offer / AggregateRating / Breadcrumb / Organization) به‌صورت خودکار در صفحات تولید می‌شود</li>
          </ul>
        </div>
        <button className="btn-primary">ذخیره تنظیمات</button>
      </ActionForm>
    </div>
  );
}
