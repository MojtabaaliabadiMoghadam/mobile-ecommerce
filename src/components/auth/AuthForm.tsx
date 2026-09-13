"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) return setError(d.error ?? "خطا");
    toast(mode === "login" ? `خوش آمدید ${d.user.name}` : "ثبت‌نام با موفقیت انجام شد؛ ۱۰۰ امتیاز هدیه گرفتید");
    router.push(d.user.role !== "customer" && next === "/account" ? "/admin" : next);
    router.refresh();
  };

  return (
    <div className="container-x mt-10 flex justify-center">
      <div className="card w-full max-w-md animate-fade-up p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30"><Smartphone className="h-6 w-6" /></span>
          <h1 className="text-xl font-extrabold">{mode === "login" ? "ورود به حساب کاربری" : "ایجاد حساب کاربری"}</h1>
          <p className="text-xs text-slate-500">{mode === "login" ? "برای پیگیری سفارش‌ها و استفاده از باشگاه مشتریان وارد شوید" : "با عضویت ۱۰۰ امتیاز هدیه باشگاه مشتریان بگیرید"}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <>
              <div><label className="label">نام و نام خانوادگی</label><input name="name" required className="input" /></div>
              <div><label className="label">شماره موبایل</label><input name="phone" className="input" dir="ltr" placeholder="09xxxxxxxxx" /></div>
            </>
          )}
          <div><label className="label">ایمیل</label><input name="email" type="email" required className="input" dir="ltr" placeholder="you@example.com" /></div>
          <div><label className="label">رمز عبور</label><input name="password" type="password" required minLength={mode === "register" ? 8 : 1} className="input" dir="ltr" /></div>
          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300">{error}</p>}
          <button disabled={busy} className="btn-primary w-full">{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "login" ? "ورود" : "ثبت‌نام"}</button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>حساب ندارید؟ <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600">ثبت‌نام کنید</Link></>
          ) : (
            <>قبلاً ثبت‌نام کرده‌اید؟ <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-brand-600">وارد شوید</Link></>
          )}
        </p>
        {mode === "login" && (
          <div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-500 dark:bg-slate-800/60">
            <p className="font-semibold text-slate-700 dark:text-slate-200">حساب‌های نمونه:</p>
            <p>ادمین: <span dir="ltr">admin@example.com / Admin@12345</span></p>
            <p>مشتری طلایی: <span dir="ltr">ali@example.com / User@12345</span></p>
            <p>مشتری نقره‌ای: <span dir="ltr">maryam@example.com / User@12345</span></p>
          </div>
        )}
      </div>
    </div>
  );
}
