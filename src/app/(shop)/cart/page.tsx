"use client";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, ready, subtotal, update, remove, clear } = useCart();
  if (!ready)
    return (
      <div className="container-x mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-28" />)}</div>
        <div className="skeleton h-56" />
      </div>
    );
  if (items.length === 0)
    return (
      <div className="container-x mt-16 flex flex-col items-center gap-4 text-center">
        <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><ShoppingBag className="h-10 w-10 text-slate-400" /></span>
        <h1 className="text-xl font-bold">سبد خرید شما خالی است</h1>
        <p className="text-sm text-slate-500">محصولات مورد علاقه‌تان را به سبد اضافه کنید</p>
        <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
      </div>
    );
  const free = subtotal >= 30000000;
  return (
    <div className="container-x mt-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">سبد خرید</h1>
        <button onClick={clear} className="text-xs text-rose-500 hover:underline">خالی کردن سبد</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.variantId} className="card flex animate-fade-up gap-4 p-4">
              <Link href={`/product/${it.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                <img src={it.image ?? "/images/hero.jpg"} alt={it.name} width={96} height={96} loading="lazy" className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={`/product/${it.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-brand-600">{it.name}</Link>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-3 w-3 rounded-full border" style={{ background: it.colorHex }} /> {it.color} • {it.storage} • رم {it.ram}
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
                    <button onClick={() => update(it.variantId, it.qty + 1)} disabled={it.qty >= it.stock} className="px-2.5 py-1.5 disabled:opacity-30" aria-label="افزایش"><Plus className="h-4 w-4" /></button>
                    <span className="w-7 text-center text-sm font-bold">{new Intl.NumberFormat("fa-IR").format(it.qty)}</span>
                    {it.qty > 1 ? (
                      <button onClick={() => update(it.variantId, it.qty - 1)} className="px-2.5 py-1.5" aria-label="کاهش"><Minus className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => remove(it.variantId)} className="px-2.5 py-1.5 text-rose-500" aria-label="حذف"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </div>
                  <p className="font-bold">{formatPrice(it.price * it.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 font-bold">خلاصه سفارش</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">قیمت کالاها</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">هزینه ارسال</span><span className={free ? "text-emerald-600" : ""}>{free ? "رایگان" : "در مرحله بعد"}</span></div>
            {!free && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">با {formatPrice(30000000 - subtotal)} خرید بیشتر، ارسال رایگان می‌شود</p>}
          </div>
          <div className="my-4 border-t border-dashed border-slate-200 dark:border-slate-700" />
          <div className="flex justify-between font-bold"><span>جمع کل</span><span className="text-brand-600 dark:text-brand-300">{formatPrice(subtotal)}</span></div>
          <Link href="/checkout" className="btn-primary mt-4 w-full">ادامه فرآیند خرید <ArrowLeft className="h-4 w-4" /></Link>
        </aside>
      </div>
    </div>
  );
}
