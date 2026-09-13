"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, Image as ImageIcon, FileText, Settings, CreditCard, Star, Menu, X, Newspaper, FolderOpen } from "lucide-react";

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
  const list = (
    <nav className="space-y-1">
      {items.filter((i) => !i.perm || perms.includes(i.perm)).map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className={`nav-link ${active ? "nav-link-active" : ""}`}>
            <i.icon className="h-4 w-4" /> {i.label}
          </Link>
        );
      })}
    </nav>
  );
  if (!mobile) return list;
  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-ghost h-9 w-9 p-0" aria-label="منو"><Menu className="h-5 w-5" /></button>
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 animate-fade-up bg-white p-4 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between font-bold">پنل مدیریت <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            {list}
          </div>
        </div>
      )}
    </>
  );
}
