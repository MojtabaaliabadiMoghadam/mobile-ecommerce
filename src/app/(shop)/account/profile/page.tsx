import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";
import { formatDateShort, ROLE_LABEL } from "@/lib/utils";

export const metadata: Metadata = { title: "اطلاعات حساب", robots: { index: false } };

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">اطلاعات حساب کاربری</h1>
      <div className="card grid gap-3 p-5 text-sm sm:grid-cols-3">
        <div><p className="text-xs text-slate-500">ایمیل</p><p dir="ltr" className="text-right font-medium">{user.email}</p></div>
        <div><p className="text-xs text-slate-500">نقش</p><p className="font-medium">{ROLE_LABEL[user.role]}</p></div>
        <div><p className="text-xs text-slate-500">تاریخ عضویت</p><p className="font-medium">{formatDateShort(user.createdAt)}</p></div>
      </div>
      <ProfileForm name={user.name} phone={user.phone ?? ""} />
    </div>
  );
}
