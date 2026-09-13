"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, Heart, MapPin, Crown, UserCog, LogOut } from "lucide-react";

const links = [
  { href: "/account", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
  { href: "/account/loyalty", label: "باشگاه مشتریان", icon: Crown },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/profile", label: "اطلاعات حساب", icon: UserCog },
];

export function AccountNav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <nav className="flex gap-1 overflow-x-auto no-scrollbar lg:flex-col">
      {links.map((l) => {
        const active = l.exact ? path === l.href : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`nav-link shrink-0 ${active ? "nav-link-active" : ""}`}>
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        );
      })}
      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/");
          router.refresh();
        }}
        className="nav-link shrink-0 text-rose-600 dark:text-rose-400"
      >
        <LogOut className="h-4 w-4" /> خروج
      </button>
    </nav>
  );
}
