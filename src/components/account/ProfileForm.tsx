"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions/shop";
import { useToast } from "@/components/ui/Toast";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <form
      className="card grid gap-4 p-5 sm:grid-cols-2"
      action={(fd) =>
        start(async () => {
          const r = await updateProfile(fd);
          if (r?.error) return toast(r.error, "error");
          toast("اطلاعات ذخیره شد");
          router.refresh();
        })
      }
    >
      <div><label className="label">نام و نام خانوادگی</label><input name="name" defaultValue={name} required className="input" /></div>
      <div><label className="label">شماره موبایل</label><input name="phone" defaultValue={phone} className="input" dir="ltr" /></div>
      <div className="sm:col-span-2 border-t border-slate-100 pt-4 text-sm font-semibold dark:border-slate-800">تغییر رمز عبور (اختیاری)</div>
      <div><label className="label">رمز عبور فعلی</label><input name="currentPassword" type="password" className="input" dir="ltr" /></div>
      <div><label className="label">رمز عبور جدید</label><input name="newPassword" type="password" minLength={8} className="input" dir="ltr" /></div>
      <div className="sm:col-span-2"><button disabled={pending} className="btn-primary">{pending ? "در حال ذخیره..." : "ذخیره تغییرات"}</button></div>
    </form>
  );
}
