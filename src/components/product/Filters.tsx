"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

type Props = {
  brands: { name: string; slug: string }[];
  colors: { v: string; hex: string }[];
  storages: string[];
  rams: string[];
  priceRange: { min: number; max: number };
  hideBrand?: boolean;
};

function Group({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-semibold">
        {title}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

export function Filters(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, start] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const selected = useCallback((k: string) => sp.getAll(k).flatMap((v) => v.split(",")).filter(Boolean), [sp]);
  const toggle = (k: string, v: string) => {
    const params = new URLSearchParams(sp.toString());
    const cur = selected(k);
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    params.delete(k);
    if (next.length) params.set(k, next.join(","));
    params.delete("page");
    start(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  };
  const setPrice = (min: string, max: string) => {
    const params = new URLSearchParams(sp.toString());
    if (min) params.set("min", min); else params.delete("min");
    if (max) params.set("max", max); else params.delete("max");
    params.delete("page");
    start(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  };
  const toggleStock = () => {
    const params = new URLSearchParams(sp.toString());
    if (params.get("inStock") === "1") params.delete("inStock"); else params.set("inStock", "1");
    start(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  };
  const clearAll = () => {
    const q = sp.get("q");
    start(() => router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname));
  };
  const activeCount = ["brand", "color", "storage", "ram"].reduce((a, k) => a + selected(k).length, 0) + (sp.get("min") || sp.get("max") ? 1 : 0) + (sp.get("inStock") ? 1 : 0);

  const Check = ({ k, v, label, swatch }: { k: string; v: string; label: string; swatch?: string }) => (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <input type="checkbox" checked={selected(k).includes(v)} onChange={() => toggle(k, v)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
      {swatch && <span className="h-4 w-4 rounded-full border border-slate-200 dark:border-slate-600" style={{ background: swatch }} />}
      {label}
    </label>
  );

  const body = (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold"><SlidersHorizontal className="h-4 w-4" /> فیلترها</span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-rose-500 hover:underline">حذف همه ({new Intl.NumberFormat("fa-IR").format(activeCount)})</button>
        )}
      </div>
      <label className="flex cursor-pointer items-center justify-between border-b border-slate-100 py-3 text-sm font-semibold dark:border-slate-800">
        فقط کالاهای موجود
        <span className={`relative h-6 w-11 rounded-full transition ${sp.get("inStock") === "1" ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700"}`}>
          <input type="checkbox" className="sr-only" checked={sp.get("inStock") === "1"} onChange={toggleStock} />
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${sp.get("inStock") === "1" ? "right-0.5" : "right-[22px]"}`} />
        </span>
      </label>
      {!props.hideBrand && (
        <Group title="برند">
          {props.brands.map((b) => <Check key={b.slug} k="brand" v={b.slug} label={b.name} />)}
        </Group>
      )}
      <Group title="محدوده قیمت (تومان)">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            setPrice(String(f.get("min") || ""), String(f.get("max") || ""));
          }}
          className="flex items-center gap-2"
        >
          <input name="min" defaultValue={sp.get("min") ?? ""} placeholder={`از ${props.priceRange.min}`} inputMode="numeric" className="input px-2 py-1.5 text-xs" />
          <input name="max" defaultValue={sp.get("max") ?? ""} placeholder={`تا ${props.priceRange.max}`} inputMode="numeric" className="input px-2 py-1.5 text-xs" />
          <button className="btn-secondary px-3 py-1.5 text-xs">اعمال</button>
        </form>
      </Group>
      <Group title="حافظه داخلی">
        <div className="flex flex-wrap gap-2">
          {props.storages.map((s) => (
            <button key={s} onClick={() => toggle("storage", s)} className={`rounded-lg border px-2.5 py-1 text-xs transition ${selected("storage").includes(s) ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "border-slate-200 dark:border-slate-700"}`}>{s}</button>
          ))}
        </div>
      </Group>
      <Group title="رم">
        <div className="flex flex-wrap gap-2">
          {props.rams.map((s) => (
            <button key={s} onClick={() => toggle("ram", s)} className={`rounded-lg border px-2.5 py-1 text-xs transition ${selected("ram").includes(s) ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "border-slate-200 dark:border-slate-700"}`}>{s}</button>
          ))}
        </div>
      </Group>
      <Group title="رنگ" defaultOpen={false}>
        <div className="max-h-56 space-y-2 overflow-y-auto">
          {props.colors.map((c) => <Check key={c.v} k="color" v={c.v} label={c.v} swatch={c.hex} />)}
        </div>
      </Group>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="btn-secondary lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> فیلترها {activeCount > 0 && <span className="badge bg-brand-600 text-white">{new Intl.NumberFormat("fa-IR").format(activeCount)}</span>}
      </button>
      <aside className="hidden lg:block">{body}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-slate-50 p-4 dark:bg-slate-950">
            <div className="mb-3 flex justify-end"><button onClick={() => setMobileOpen(false)} className="btn-ghost"><X className="h-5 w-5" /></button></div>
            {body}
            <button onClick={() => setMobileOpen(false)} className="btn-primary mt-4 w-full">مشاهده نتایج</button>
          </div>
        </div>
      )}
    </>
  );
}

export function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const opts = [
    ["newest", "جدیدترین"],
    ["bestselling", "پرفروش‌ترین"],
    ["cheapest", "ارزان‌ترین"],
    ["expensive", "گران‌ترین"],
    ["rating", "بالاترین امتیاز"],
    ["discount", "بیشترین تخفیف"],
  ];
  const cur = sp.get("sort") ?? "newest";
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-slate-500">مرتب‌سازی:</span>
      <div className="hidden gap-1 md:flex">
        {opts.map(([k, l]) => (
          <button
            key={k}
            onClick={() => {
              const p = new URLSearchParams(sp.toString());
              p.set("sort", k);
              p.delete("page");
              router.push(`${pathname}?${p.toString()}`, { scroll: false });
            }}
            className={`rounded-lg px-3 py-1.5 transition ${cur === k ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <select
        value={cur}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.set("sort", e.target.value);
          router.push(`${pathname}?${p.toString()}`);
        }}
        className="input w-auto md:hidden"
      >
        {opts.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
      <span className="mr-auto text-xs text-slate-500">{new Intl.NumberFormat("fa-IR").format(total)} کالا</span>
    </div>
  );
}
