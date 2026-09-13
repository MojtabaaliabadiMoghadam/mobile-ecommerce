"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Truck, CreditCard, Tag, Loader2, Store, Banknote, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, SHIPPING_METHOD, TIERS, type Tier } from "@/lib/utils";
import type { Address } from "@/db/schema";
import { saveAddress } from "@/app/actions/shop";

type Gateway = { key: string; name: string; description: string | null };

export function CheckoutForm({ addresses: initial, gateways, tier }: { addresses: Address[]; gateways: Gateway[]; tier: Tier }) {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState(initial);
  const [addressId, setAddressId] = useState<number | null>(initial.find((a) => a.isDefault)?.id ?? initial[0]?.id ?? null);
  const [showNew, setShowNew] = useState(initial.length === 0);
  const [shipping, setShipping] = useState<"post" | "express" | "pickup">("post");
  const [payment, setPayment] = useState<string>(gateways[0]?.key ?? "zarinpal");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && items.length === 0 && !busy) router.replace("/cart");
  }, [ready, items.length, router, busy]);
  useEffect(() => {
    if (shipping === "pickup" && payment === "cod") setPayment("in_store");
    if (shipping !== "pickup" && payment === "in_store") setPayment("cod");
  }, [shipping, payment]);

  const tierDiscount = !applied && TIERS[tier].discount > 0 ? Math.floor((subtotal * TIERS[tier].discount) / 100) : 0;
  const discount = applied?.discount ?? tierDiscount;
  const shippingCost = shipping === "pickup" ? 0 : subtotal >= 30000000 ? 0 : SHIPPING_METHOD[shipping].cost;
  const total = subtotal - discount + shippingCost;
  const availableGateways = gateways.filter((g) => (shipping === "pickup" ? g.key !== "cod" : g.key !== "in_store"));

  const applyCoupon = async () => {
    const r = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: coupon, subtotal }) });
    const d = await r.json();
    if (!d.ok) return toast(d.message, "error");
    setApplied({ code: d.code, discount: d.discount });
    toast("کد تخفیف اعمال شد");
  };

  const submit = async () => {
    const addr = addresses.find((a) => a.id === addressId);
    if (!addr) return toast("لطفاً آدرس تحویل را انتخاب کنید", "error");
    setBusy(true);
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        address: { receiverName: addr.receiverName, receiverPhone: addr.receiverPhone, province: addr.province, city: addr.city, postalCode: addr.postalCode, line: addr.line },
        shippingMethod: shipping,
        paymentMethod: payment,
        couponCode: applied?.code,
        note,
      }),
    });
    const d = await r.json();
    if (!r.ok) {
      setBusy(false);
      return toast(d.error ?? "خطا در ثبت سفارش", "error");
    }
    clear();
    window.location.href = d.redirect;
  };

  if (!ready) return <div className="skeleton h-96" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        {/* Address */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><MapPin className="h-5 w-5 text-brand-600" /> آدرس تحویل</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {addresses.map((a) => (
              <label key={a.id} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${addressId === a.id ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-700"}`}>
                <input type="radio" name="addr" className="sr-only" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                <p className="font-semibold">{a.title} — {a.receiverName}</p>
                <p className="mt-1 text-xs text-slate-500">{a.province}، {a.city}، {a.line}</p>
                <p className="text-xs text-slate-500" dir="ltr">{a.receiverPhone}</p>
              </label>
            ))}
          </div>
          {!showNew ? (
            <button onClick={() => setShowNew(true)} className="btn-secondary mt-3"><Plus className="h-4 w-4" /> آدرس جدید</button>
          ) : (
            <form
              className="mt-4 grid gap-3 rounded-xl border border-dashed border-slate-300 p-4 sm:grid-cols-2 dark:border-slate-700"
              action={async (fd) => {
                const r = await saveAddress(fd);
                if (r?.error) return toast(r.error, "error");
                const res = await fetch("/api/addresses").then((x) => x.json());
                setAddresses(res.addresses);
                setAddressId(res.addresses[res.addresses.length - 1]?.id ?? null);
                setShowNew(false);
                toast("آدرس ذخیره شد");
              }}
            >
              <input name="title" placeholder="عنوان (خانه، محل کار)" className="input" />
              <input name="receiverName" required placeholder="نام گیرنده" className="input" />
              <input name="receiverPhone" required placeholder="شماره موبایل گیرنده" className="input" dir="ltr" />
              <input name="postalCode" required placeholder="کد پستی" className="input" dir="ltr" />
              <input name="province" required placeholder="استان" className="input" />
              <input name="city" required placeholder="شهر" className="input" />
              <textarea name="line" required placeholder="آدرس کامل" className="input sm:col-span-2" rows={2} />
              <div className="flex gap-2 sm:col-span-2">
                <button className="btn-primary">ذخیره آدرس</button>
                {addresses.length > 0 && <button type="button" onClick={() => setShowNew(false)} className="btn-ghost">انصراف</button>}
              </div>
            </form>
          )}
        </section>

        {/* Shipping */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><Truck className="h-5 w-5 text-brand-600" /> روش ارسال</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.entries(SHIPPING_METHOD) as [typeof shipping, (typeof SHIPPING_METHOD)[string]][]).map(([k, m]) => (
              <label key={k} className={`cursor-pointer rounded-xl border p-3 text-sm transition ${shipping === k ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-700"}`}>
                <input type="radio" name="ship" className="sr-only" checked={shipping === k} onChange={() => setShipping(k)} />
                <p className="flex items-center gap-2 font-semibold">{k === "pickup" ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />} {m.label}</p>
                <p className="mt-1 text-xs text-slate-500">{m.eta}</p>
                <p className="mt-1 text-xs font-medium">{k !== "pickup" && subtotal >= 30000000 ? <span className="text-emerald-600">رایگان</span> : m.cost === 0 ? "رایگان" : formatPrice(m.cost)}</p>
              </label>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><CreditCard className="h-5 w-5 text-brand-600" /> روش پرداخت</h2>
          <div className="space-y-2">
            {availableGateways.map((g) => (
              <label key={g.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${payment === g.key ? "border-brand-600 bg-brand-50/50 dark:bg-brand-900/20" : "border-slate-200 dark:border-slate-700"}`}>
                <input type="radio" name="pay" className="accent-brand-600" checked={payment === g.key} onChange={() => setPayment(g.key)} />
                {g.key === "zarinpal" ? <CreditCard className="h-5 w-5 text-amber-500" /> : g.key === "cod" ? <Banknote className="h-5 w-5 text-emerald-500" /> : <Store className="h-5 w-5 text-brand-500" />}
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs text-slate-500">{g.description}</p>
                </div>
              </label>
            ))}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="توضیحات سفارش (اختیاری)" className="input mt-4" rows={2} />
        </section>
      </div>

      <aside className="card h-fit p-5 lg:sticky lg:top-24">
        <h2 className="mb-3 font-bold">خلاصه سفارش</h2>
        <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto text-xs">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-2">
              <span className="truncate">{i.name} × {i.qty}</span>
              <span className="shrink-0">{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="کد تخفیف" className="input pr-9 text-xs uppercase" dir="ltr" disabled={!!applied} />
          </div>
          {applied ? (
            <button onClick={() => { setApplied(null); setCoupon(""); }} className="btn-secondary text-xs">حذف</button>
          ) : (
            <button onClick={applyCoupon} disabled={!coupon} className="btn-secondary text-xs">اعمال</button>
          )}
        </div>
        {tierDiscount > 0 && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">تخفیف {TIERS[tier].discount}٪ سطح {TIERS[tier].label} باشگاه مشتریان به‌صورت خودکار اعمال شد</p>}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">جمع کالاها</span><span>{formatPrice(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-emerald-600"><span>تخفیف</span><span>− {formatPrice(discount)}</span></div>}
          <div className="flex justify-between"><span className="text-slate-500">ارسال</span><span>{shippingCost === 0 ? "رایگان" : formatPrice(shippingCost)}</span></div>
        </div>
        <div className="my-4 border-t border-dashed border-slate-200 dark:border-slate-700" />
        <div className="flex justify-between text-base font-extrabold"><span>مبلغ قابل پرداخت</span><span className="text-brand-600 dark:text-brand-300">{formatPrice(total)}</span></div>
        <p className="mt-2 text-xs text-slate-400">با این خرید {new Intl.NumberFormat("fa-IR").format(Math.floor(total / 100000))} امتیاز باشگاه دریافت می‌کنید</p>
        <button onClick={submit} disabled={busy || !addressId} className="btn-primary mt-4 w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {payment === "zarinpal" ? "پرداخت و ثبت سفارش" : "ثبت سفارش"}
        </button>
      </aside>
    </div>
  );
}
