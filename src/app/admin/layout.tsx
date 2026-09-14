import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Smartphone, Store } from "lucide-react";
import { getCurrentUser, hasPermission, isStaff } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AdminNav } from "@/components/admin/AdminNav";
import { ROLE_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: { default: "پنل مدیریت", template: "%s | پنل مدیریت" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!isStaff(user)) redirect("/account");
  const perms = ["products", "orders", "users", "coupons", "content", "payments", "settings"].filter((p) => hasPermission(user, p));
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/admin" className="flex items-center gap-2 px-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white"><Smartphone className="h-5 w-5" /></span>
            پنل مدیریت
          </Link>
          <div className="mt-6 flex-1 overflow-y-auto"><AdminNav perms={perms} /></div>
          <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
            <p className="font-semibold">{user.name}</p>
            <p className="text-slate-500">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="lg:hidden"><AdminNav perms={perms} mobile /></div>
          <span className="min-w-0 max-w-[38vw] truncate text-sm text-slate-500 sm:max-w-none">خوش آمدید، {user.name}</span>
          <div className="mr-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/" className="btn-secondary h-9 px-3 text-xs" aria-label="مشاهده فروشگاه">
              <Store className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">مشاهده فروشگاه</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
