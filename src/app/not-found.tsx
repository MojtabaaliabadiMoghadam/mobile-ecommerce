import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <SearchX className="h-16 w-16 text-slate-300" />
      <h1 className="text-2xl font-extrabold">صفحه مورد نظر یافت نشد</h1>
      <p className="text-sm text-slate-500">ممکن است آدرس اشتباه باشد یا صفحه حذف شده باشد.</p>
      <Link href="/" className="btn-primary">بازگشت به صفحه اصلی</Link>
    </div>
  );
}
