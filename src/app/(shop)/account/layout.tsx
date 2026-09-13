import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";
import { TIERS } from "@/lib/utils";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const tier = TIERS[user.loyaltyTier];
  return (
    <div className="container-x mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-3">
        <div className={`card overflow-hidden bg-gradient-to-l ${tier.color} p-5 text-white`}>
          <p className="text-xs opacity-80">سطح باشگاه</p>
          <p className="text-xl font-extrabold">{tier.label}</p>
          <p className="mt-2 text-sm">{user.name}</p>
          <p className="text-xs opacity-80" dir="ltr">{user.email}</p>
        </div>
        <div className="card p-2">
          <AccountNav />
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
