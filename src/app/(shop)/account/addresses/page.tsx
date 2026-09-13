import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { getUserAddresses } from "@/lib/data";
import { AddressManager } from "@/components/account/AddressManager";

export const metadata: Metadata = { title: "آدرس‌های من", robots: { index: false } };

export default async function AddressesPage() {
  const user = (await getCurrentUser())!;
  const addresses = await getUserAddresses(user.id);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold">آدرس‌های من</h1>
      <AddressManager addresses={addresses} />
    </div>
  );
}
