import { Star } from "lucide-react";

export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`امتیاز ${value} از ۵`}>
      <span className="flex" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}
          />
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-slate-500">({new Intl.NumberFormat("fa-IR").format(count)})</span>}
    </span>
  );
}
