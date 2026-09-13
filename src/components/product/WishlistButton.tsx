"use client";
import { Heart } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/app/actions/shop";
import { useToast } from "@/components/ui/Toast";

export function WishlistButton({ productId, initial, className = "" }: { productId: number; initial: boolean; className?: string }) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <button
      aria-label={active ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await toggleWishlist(productId);
          if (r.error === "auth") {
            toast("برای افزودن به علاقه‌مندی‌ها وارد شوید", "error");
            router.push("/login");
            return;
          }
          setActive(!!r.added);
          toast(r.added ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد");
        });
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 dark:bg-slate-800/90 ${className}`}
    >
      <Heart className={`h-4.5 w-4.5 transition ${active ? "fill-rose-500 text-rose-500" : "text-slate-500"}`} />
    </button>
  );
}
