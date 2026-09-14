"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Image as ImageIcon, FileText, Settings, CreditCard, Star, Menu, X, Newspaper, FolderOpen, Smartphone } from "lucide-react";

const items = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, perm: null, exact: true },
  { href: "/admin/products", label: "محصولات", icon: Package, perm: "products" },
  { href: "/admin/reviews", label: "نظرات", icon: Star, perm: "products" },
  { href: "/admin/orders", label: "سفارشات", icon: ShoppingCart, perm: "orders" },
  { href: "/admin/users", label: "کاربران و باشگاه", icon: Users, perm: "users" },
  { href: "/admin/coupons", label: "کدهای تخفیف", icon: Ticket, perm: "coupons" },
  { href: "/admin/articles", label: "مقالات", icon: Newspaper, perm: "content" },
  { href: "/admin/media", label: "مدیریت تصاویر", icon: FolderOpen, perm: "content" },
  { href: "/admin/banners", label: "بنرها", icon: ImageIcon, perm: "content" },
  { href: "/admin/pages", label: "صفحات استاتیک", icon: FileText, perm: "content" },
  { href: "/admin/gateways", label: "درگاه‌های پرداخت", icon: CreditCard, perm: "payments" },
  { href: "/admin/settings", label: "تنظیمات و سئو", icon: Settings, perm: "settings" },
];

export function AdminNav({ perms, mobile = false }: { perms: string[]; mobile?: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  // دراور موبایل: قفل کردن اسکرول صفحه هنگام باز بودن و بستن با کلید Escape
  useEffect(() => {
    if (!mobile || !open) return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobile, open]);

  const list = (
    <nav className="space-y-1">
      {items.filter((i) => !i.perm || perms.includes(i.perm)).map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-link-active" : ""}`}>
            <i.icon className="h-4 w-4 shrink-0" /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
  if (!mobile) return list;
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost h-9 w-9 p-0" aria-label="باز کردن منو" aria-expanded={open}>
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="منوی پنل مدیریت">
          {/* پس‌زمینه تیره — با لمس آن منو بسته می‌شود */}
          <div className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* دراور کشویی از سمت راست */}
          <div className="absolute inset-y-0 right-0 flex h-dvh w-[300px] max-w-[85vw] animate-drawer-in flex-col overflow-hidden rounded-l-2xl border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 dark:border-slate-800">
              <span className="flex items-center gap-2 text-base font-extrabold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Smartphone className="h-5 w-5" />
                </span>
                پنل مدیریت
              </span>
              <button onClick={() => setOpen(false)} className="btn-ghost h-9 w-9 p-0" aria-label="بستن منو">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
              {list}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
