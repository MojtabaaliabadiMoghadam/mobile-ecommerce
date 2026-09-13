import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserWishlist } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";

export const metadata: Metadata = { title: "علاقه‌مندی‌ها", robots: { index: false } };

export default async function WishlistPage() {
  const user = (await getCurrentUser())!;
  const items = await getUserWishlist(user.id);
  return (
    <div>
      <h1 className="text-2xl font-extrabold">علاقه‌مندی‌ها</h1>
      {items.length === 0 ? (
        <div className="card mt-4 flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">هنوز محصولی به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
          <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
          {items.map((p) => <ProductCard key={p.id} p={p} wished />)}
        </div>
      )}
    </div>
  );
}
