"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelMyOrder } from "@/app/actions/shop";
import { useToast } from "@/components/ui/Toast";

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("آیا از لغو این سفارش مطمئن هستید؟")) return;
        start(async () => {
          const r = await cancelMyOrder(orderId);
          if (r.error) toast(r.error, "error");
          else {
            toast("سفارش لغو شد");
            router.refresh();
          }
        });
      }}
      className="btn-danger"
    >
      لغو سفارش
    </button>
  );
}
