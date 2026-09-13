"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut, LayoutDashboard, Heart, Package, ChevronDown, Menu, X, Smartphone } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" aria-label="سبد خرید" className="btn-ghost relative h-10 w-10 rounded-full p-0">
      <ShoppingCart className="h-5 w-5" />
      {ready && count > 0 && (
        <span className="absolute -left-1 -top-1 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
          {new Intl.NumberFormat("fa-IR").format(count)}
        </span>
      )}
    </Link>
  );
}

export function UserMenu({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  if (!user)
    return (
      <Link href="/login" className="btn-secondary h-10 rounded-full px-4">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">ورود / ثبت‌نام</span>
      </Link>
    );
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="btn-secondary h-10 rounded-full px-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">{user.name.charAt(0)}</span>
        <span className="hidden max-w-24 truncate text-xs sm:inline">{user.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="card absolute left-0 top-full z-50 mt-2 w-52 animate-pop p-2">
            <Link href="/account" onClick={() => setOpen(false)} className="nav-link"><LayoutDashboard className="h-4 w-4" /> داشبورد</Link>
            <Link href="/account/orders" onClick={() => setOpen(false)} className="nav-link"><Package className="h-4 w-4" /> سفارش‌های من</Link>
            <Link href="/account/wishlist" onClick={() => setOpen(false)} className="nav-link"><Heart className="h-4 w-4" /> علاقه‌مندی‌ها</Link>
            {user.role !== "customer" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="nav-link text-brand-600 dark:text-brand-300"><LayoutDashboard className="h-4 w-4" /> پنل مدیریت</Link>
            )}
            <button onClick={logout} className="nav-link w-full text-rose-600 dark:text-rose-400"><LogOut className="h-4 w-4" /> خروج</button>
          </div>
        </>
      )}
    </div>
  );
}

export function MobileNav({ categories, brands }: { categories: { name: string; slug: string }[]; brands: { name: string; slug: string }[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // قفل اسکرول بدنه هنگام باز بودن منو
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // بستن با کلید Escape
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost h-10 w-10 rounded-full p-0 lg:hidden" aria-label="منو" aria-expanded={open}>
        <Menu className="h-5 w-5" />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="lg:hidden">
            {/* پس‌زمینه */}
            <div
              className="fixed inset-0 z-[95] bg-slate-950/50 backdrop-blur-sm transition-opacity"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            {/* پنل کشویی سمت راست */}
            <div className="fixed inset-y-0 right-0 z-[97] flex w-[22rem] max-w-[86%] flex-col bg-white shadow-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <span className="flex items-center gap-2 text-lg font-extrabold">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  اکسیر موبایل
                </span>
                <button onClick={() => setOpen(false)} aria-label="بستن" className="btn-ghost h-9 w-9 rounded-full p-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-1 px-3 text-xs font-semibold text-slate-400">دسته‌بندی‌ها</p>
                {categories.map((c) => (
                  <Link key={c.slug} href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="nav-link py-3">
                    {c.name}
                  </Link>
                ))}

                <div className="my-3 h-px bg-slate-100 dark:bg-slate-800" />

                <p className="mb-1 px-3 text-xs font-semibold text-slate-400">برندها</p>
                {brands.map((b) => (
                  <Link key={b.slug} href={`/products?brand=${b.slug}`} onClick={() => setOpen(false)} className="nav-link py-3">
                    {b.name}
                  </Link>
                ))}

                <div className="my-3 h-px bg-slate-100 dark:bg-slate-800" />

                <p className="mb-1 px-3 text-xs font-semibold text-slate-400">بیشتر</p>
                <Link href="/products" onClick={() => setOpen(false)} className="nav-link py-3">همه محصولات</Link>
                <Link href="/blog" onClick={() => setOpen(false)} className="nav-link py-3">مقالات و راهنمای خرید</Link>
                <Link href="/p/about" onClick={() => setOpen(false)} className="nav-link py-3">درباره ما</Link>
                <Link href="/p/contact" onClick={() => setOpen(false)} className="nav-link py-3">تماس با ما</Link>
              </nav>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
