"use client";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Hit = { id: number; name: string; slug: string; basePrice: number; image: string | null; brandName: string | null };

export function SearchBox({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => {
          setHits(d.items ?? []);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={box} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) {
            setOpen(false);
            router.push(`/products?q=${encodeURIComponent(q.trim())}`);
          }
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          placeholder="جستجوی گوشی، برند یا مدل..."
          className="input h-11 rounded-full bg-slate-100 pr-11 pl-4 dark:bg-slate-800"
          aria-label="جستجو"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </span>
      </form>
      {open && hits.length > 0 && (
        <div className="card absolute inset-x-0 top-full z-50 mt-2 animate-pop overflow-hidden p-2">
          {hits.map((h) => (
            <Link
              key={h.id}
              href={`/product/${h.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <img src={h.image ?? "/images/hero.jpg"} alt={h.name} width={48} height={48} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{h.name}</p>
                <p className="text-xs text-slate-500">{h.brandName}</p>
              </div>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">{formatPrice(h.basePrice)}</span>
            </Link>
          ))}
          <Link href={`/products?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="block rounded-xl p-2 text-center text-xs text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800">
            مشاهده همه نتایج «{q}»
          </Link>
        </div>
      )}
    </div>
  );
}
