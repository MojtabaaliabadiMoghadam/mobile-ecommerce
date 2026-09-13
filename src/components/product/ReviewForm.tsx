"use client";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import { submitReview } from "@/app/actions/shop";
import { useToast } from "@/components/ui/Toast";

export function ReviewForm({ productId, slug, loggedIn }: { productId: number; slug: string; loggedIn: boolean }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  if (!loggedIn)
    return (
      <div className="card p-5 text-center text-sm text-slate-500">
        برای ثبت نظر ابتدا <Link href={`/login?next=/product/${slug}`} className="font-semibold text-brand-600">وارد شوید</Link>. با ثبت هر نظر ۵۰ امتیاز باشگاه مشتریان دریافت می‌کنید.
      </div>
    );
  return (
    <form
      className="card space-y-3 p-5"
      action={(fd) =>
        start(async () => {
          const r = await submitReview(fd);
          if (r?.error) toast(r.error, "error");
          else {
            toast("نظر شما ثبت شد. ۵۰ امتیاز به حساب شما اضافه شد");
            (document.getElementById("review-form") as HTMLFormElement | null)?.reset();
          }
        })
      }
      id="review-form"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <p className="font-semibold">نظر خود را ثبت کنید</p>
      <div className="flex items-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => setRating(i)} aria-label={`${i} ستاره`}>
            <Star className={`h-7 w-7 transition ${i <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
          </button>
        ))}
      </div>
      <input name="title" placeholder="عنوان نظر" className="input" />
      <textarea name="body" required rows={3} placeholder="تجربه خود از این محصول را بنویسید..." className="input" />
      <button disabled={pending} className="btn-primary">{pending ? "در حال ارسال..." : "ثبت نظر"}</button>
    </form>
  );
}
