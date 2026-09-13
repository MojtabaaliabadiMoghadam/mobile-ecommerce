"use client";
import { useMemo, useState } from "react";
import { ShoppingCart, Check, Store, Truck, ShieldCheck, Minus, Plus } from "lucide-react";
import Link from "next/link";
import type { ProductVariant } from "@/db/schema";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";

type Props = { product: { id: number; name: string; slug: string; image: string | null; compareAtPrice: number | null; discountPercent: number }; variants: ProductVariant[] };

export function ProductBuyBox({ product, variants }: Props) {
  const colors = useMemo(() => Array.from(new Map(variants.map((v) => [v.color, v.colorHex])).entries()), [variants]);
  const [color, setColor] = useState(() => variants.find((v) => v.stock > 0)?.color ?? variants[0]?.color);
  const configs = useMemo(() => {
    const seen = new Set<string>();
    return variants.filter((v) => v.color === color).filter((v) => { const k = `${v.storage}-${v.ram}`; if (seen.has(k)) return false; seen.add(k); return true; });
  }, [variants, color]);
  const [cfg, setCfg] = useState<string>(() => {
    const c = variants.find((v) => v.color === color && v.stock > 0) ?? variants.find((v) => v.color === color);
    return c ? `${c.storage}-${c.ram}` : "";
  });
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.color === color && `${v.storage}-${v.ram}` === cfg) ?? configs[0];
  const chooseColor = (c: string) => {
    setColor(c);
    const first = variants.find((v) => v.color === c && `${v.storage}-${v.ram}` === cfg) ?? variants.find((v) => v.color === c && v.stock > 0) ?? variants.find((v) => v.color === c);
    if (first) setCfg(`${first.storage}-${first.ram}`);
    setQty(1);
  };
  const addToCart = () => {
    if (!variant || variant.stock < 1) return;
    add({ variantId: variant.id, productId: product.id, name: product.name, slug: product.slug, image: product.image, color: variant.color, colorHex: variant.colorHex, storage: variant.storage, ram: variant.ram, price: variant.price, stock: variant.stock }, qty);
    setAdded(true);
    toast("محصول به سبد خرید اضافه شد");
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="card p-5 lg:sticky lg:top-24">
      <div>
        <p className="mb-2 text-sm font-semibold">رنگ: <span className="font-normal text-slate-500">{color}</span></p>
        <div className="flex flex-wrap gap-2">
          {colors.map(([c, hex]) => (
            <button key={c} onClick={() => chooseColor(c)} title={c} aria-label={c} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition hover:scale-110 ${color === c ? "border-brand-600 ring-2 ring-brand-600/30" : "border-slate-200 dark:border-slate-700"}`} style={{ background: hex }}>
              {color === c && <Check className="h-4 w-4 text-white mix-blend-difference" />}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold">حافظه / رم</p>
        <div className="flex flex-wrap gap-2">
          {configs.map((v) => {
            const k = `${v.storage}-${v.ram}`;
            return (
              <button key={k} onClick={() => { setCfg(k); setQty(1); }} disabled={v.stock < 1} className={`rounded-xl border px-3 py-2 text-xs font-medium transition disabled:opacity-40 disabled:line-through ${cfg === k ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "border-slate-200 hover:border-slate-400 dark:border-slate-700"}`}>
                {v.storage} <span className="text-slate-400">/</span> رم {v.ram}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
        {variant && (
          <>
            {product.discountPercent > 0 && product.compareAtPrice && (
              <div className="flex items-center gap-2">
                <span className="badge bg-rose-500 text-white">{new Intl.NumberFormat("fa-IR").format(product.discountPercent)}٪</span>
                <span className="text-sm text-slate-400 line-through">{formatPrice(Math.round(variant.price / (1 - product.discountPercent / 100)))}</span>
              </div>
            )}
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{formatPrice(variant.price)}</p>
            <p className={`mt-1 text-xs ${variant.stock > 0 ? (variant.stock <= 3 ? "text-amber-600" : "text-emerald-600") : "text-rose-500"}`}>
              {variant.stock > 0 ? (variant.stock <= 3 ? `فقط ${new Intl.NumberFormat("fa-IR").format(variant.stock)} عدد باقی مانده` : "موجود در انبار") : "ناموجود"}
            </p>
          </>
        )}
        <div className="mt-4 flex gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setQty((q) => Math.min(variant?.stock ?? 1, q + 1))} className="px-3 py-2.5 hover:text-brand-600" aria-label="افزایش"><Plus className="h-4 w-4" /></button>
            <span className="w-8 text-center text-sm font-bold">{new Intl.NumberFormat("fa-IR").format(qty)}</span>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2.5 hover:text-brand-600" aria-label="کاهش"><Minus className="h-4 w-4" /></button>
          </div>
          <button onClick={addToCart} disabled={!variant || variant.stock < 1} className="btn-primary flex-1">
            {added ? <><Check className="h-4 w-4" /> اضافه شد</> : <><ShoppingCart className="h-4 w-4" /> افزودن به سبد</>}
          </button>
        </div>
        {added && <Link href="/cart" className="btn-secondary mt-2 w-full">مشاهده سبد خرید</Link>}
      </div>
      <ul className="mt-5 space-y-2 text-xs text-slate-500">
        <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500" /> ضمانت اصالت و ۱۸ ماه گارانتی</li>
        <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand-500" /> ارسال به سراسر کشور</li>
        <li className="flex items-center gap-2"><Store className="h-4 w-4 text-amber-500" /> امکان تحویل و پرداخت حضوری</li>
      </ul>
    </div>
  );
}

export function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [i, setI] = useState(0);
  const cur = images[i] ?? { url: "/images/hero.jpg", alt: name };
  return (
    <div>
      <div className="card overflow-hidden">
        <img src={cur.url} alt={cur.alt} width={800} height={800} className="aspect-square w-full object-cover transition duration-300" fetchPriority="high" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img, k) => (
            <button key={k} onClick={() => setI(k)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${k === i ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"}`} aria-label={`تصویر ${k + 1}`}>
              <img src={img.url} alt={img.alt} width={80} height={80} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
