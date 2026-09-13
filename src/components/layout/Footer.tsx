import Link from "next/link";
import { Smartphone, MapPin, Phone, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { getCategories, getPublishedPages, getSettings } from "@/lib/data";

export async function Footer() {
  const [s, cats, pgs] = await Promise.all([getSettings(), getCategories(), getPublishedPages()]);
  const features = [
    { icon: ShieldCheck, t: "ضمانت اصالت کالا", d: "تمامی محصولات اورجینال و رجیستر شده" },
    { icon: Truck, t: "ارسال سریع", d: "ارسال به سراسر کشور با پست و پیک" },
    { icon: RotateCcw, t: "۷ روز ضمانت بازگشت", d: "بازگشت آسان در صورت مشکل" },
    { icon: Headphones, t: "پشتیبانی ۷ روز هفته", d: "پاسخگویی آنلاین و تلفنی" },
  ];
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="container-x grid grid-cols-2 gap-4 py-8 md:grid-cols-4">
        {features.map((f) => (
          <div key={f.t} className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <f.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{f.t}</p>
              <p className="text-xs text-slate-500">{f.d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="container-x grid gap-8 border-t border-slate-100 py-10 dark:border-slate-800 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><Smartphone className="h-5 w-5" /></span>
            {s.site_name}
          </div>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">{s.meta_description}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><MapPin className="h-4 w-4 text-brand-500" /> {s.store_address}</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Phone className="h-4 w-4 text-brand-500" /> <span dir="ltr">{s.store_phone}</span></p>
        </div>
        <div>
          <h3 className="mb-3 font-bold">دسته‌بندی‌ها</h3>
          <ul className="space-y-2 text-sm text-slate-500">
            {cats.map((c) => (
              <li key={c.slug}><Link href={`/category/${c.slug}`} className="hover:text-brand-600">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-bold">راهنما</h3>
          <ul className="space-y-2 text-sm text-slate-500">
            <li><Link href="/blog" className="hover:text-brand-600">مقالات و راهنمای خرید</Link></li>
            {pgs.map((p) => (
              <li key={p.slug}><Link href={`/p/${p.slug}`} className="hover:text-brand-600">{p.title}</Link></li>
            ))}
            <li><Link href="/account/orders" className="hover:text-brand-600">پیگیری سفارش</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
        © {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(1403)} {s.site_name} — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
