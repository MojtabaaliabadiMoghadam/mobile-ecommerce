import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getActiveGateways, getUserAddresses } from "@/lib/data";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "تسویه حساب", robots: { index: false } };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  const [addresses, gateways] = await Promise.all([getUserAddresses(user.id), getActiveGateways()]);
  return (
    <div className="container-x mt-8">
      <h1 className="mb-5 text-2xl font-extrabold">تسویه حساب</h1>
      <CheckoutForm addresses={addresses} gateways={gateways.map((g) => ({ key: g.key, name: g.name, description: g.description }))} tier={user.loyaltyTier} />
    </div>
  );
}
