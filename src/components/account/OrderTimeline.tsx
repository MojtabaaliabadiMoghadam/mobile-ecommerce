import { Check, Clock, Package, Truck, Home, XCircle } from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import { ORDER_STATUS, ORDER_STEPS, formatDate } from "@/lib/utils";

const icons = { pending_payment: Clock, processing: Package, shipped: Truck, delivered: Home } as const;

export function OrderTimeline({ status, history }: { status: OrderStatus; history: { status: OrderStatus; note: string | null; createdAt: Date }[] }) {
  const cancelled = status === "cancelled";
  const currentStep = cancelled ? (history.filter((h) => h.status !== "cancelled").length - 1) : ORDER_STATUS[status].step;
  return (
    <div>
      <ol className="relative flex items-start justify-between">
        {ORDER_STEPS.map((s, i) => {
          const done = !cancelled && i <= currentStep;
          const Icon = icons[s as keyof typeof icons];
          return (
            <li key={s} className="relative flex flex-1 flex-col items-center text-center">
              {i < ORDER_STEPS.length - 1 && (
                <span className={`absolute left-[-50%] top-5 h-0.5 w-full ${!cancelled && i < currentStep ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"}`} />
              )}
              <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"} ${!cancelled && i === currentStep ? "ring-4 ring-emerald-500/20" : ""}`}>
                {done && i < currentStep ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span className={`mt-2 text-[11px] font-medium sm:text-xs ${done ? "text-emerald-600" : "text-slate-400"}`}>{ORDER_STATUS[s].label}</span>
            </li>
          );
        })}
      </ol>
      {cancelled && (
        <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-300"><XCircle className="h-4 w-4" /> این سفارش لغو شده است</p>
      )}
      <ul className="mt-6 space-y-3 border-r-2 border-slate-100 pr-4 dark:border-slate-800">
        {history.map((h, i) => (
          <li key={i} className="relative text-sm">
            <span className={`absolute -right-[21px] top-1.5 h-3 w-3 rounded-full ${h.status === "cancelled" ? "bg-rose-500" : "bg-emerald-500"}`} />
            <p className="font-medium">{ORDER_STATUS[h.status].label}</p>
            {h.note && <p className="text-xs text-slate-500">{h.note}</p>}
            <p className="text-[11px] text-slate-400">{formatDate(h.createdAt)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
