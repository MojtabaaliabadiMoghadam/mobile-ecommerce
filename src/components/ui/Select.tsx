"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";

export type SelectOption = { value: string; label: string };

/**
 * سلکت‌باکس سفارشی (کامبوباکس):
 *  • دسکتاپ: لیست مستقیم زیر اینپوت باز می‌شود.
 *  • موبایل: لیست به‌صورت شیت ثابت (fixed) از پایین صفحه باز می‌شود تا در هیچ حالتی
 *    زیر مودال/کادرها کپ یا جابه‌جا نشود — رفتار native سلکت که در بعضی مرورگرها
 *    داخل کانتینرهای transform/overflow خراب می‌شد کاملاً حذف شده است.
 *  • با <input type="hidden"> همان‌طور که قبل مقدار در FormData می‌نشیند؛ سروراکشن‌ها بدون تغییر کار می‌کنند.
 */
export function Select({
  name,
  options,
  defaultValue = "",
  value: controlled,
  onChange,
  placeholder = "—",
  label,
  className = "",
  dir,
}: {
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** عنوان لیست (در شیت موبایل نمایش داده می‌شود) */
  label?: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  const [inner, setInner] = useState(defaultValue);
  const value = controlled !== undefined ? controlled : inner;
  const [open, setOpen] = useState(false);

  // بستن با Escape + قفل اسکرول وقتی شیت موبایل باز است
  useEffect(() => {
    if (!open) return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = options.find((o) => o.value === value);
  const choose = (v: string) => {
    setInner(v);
    onChange?.(v);
    setOpen(false);
  };

  const list = (
    <ul role="listbox" className="space-y-0.5">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <li key={o.value}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => choose(o.value)}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-right text-sm transition ${
                selected ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              dir={dir}
            >
              <span className="min-w-0 truncate">{o.label}</span>
              {selected && <Check className="h-4 w-4 shrink-0" />}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className={`relative ${className}`}>
      {name !== undefined && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="input relative w-full cursor-pointer pe-9 text-start"
        dir={dir}
      >
        <span className={`block truncate ${current ? "" : "text-slate-400"}`}>{current?.label ?? placeholder}</span>
        <ChevronDown className={`pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* دسکتاپ: لیست دقیقاً زیر اینپوت */}
          <div className="fixed inset-0 z-40 hidden bg-transparent sm:block" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute inset-x-0 top-full z-50 mt-1.5 hidden animate-pop overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:block sm:max-h-60">
            {list}
          </div>

          {/* موبایل: شیت پایین — در هیچ حالتی کپ نمی‌شود */}
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:hidden" role="dialog" aria-modal="true">
            <div className="absolute inset-0 animate-fade-in bg-slate-950/50" onClick={() => setOpen(false)} />
            <div className="relative w-full animate-fade-up rounded-t-2xl border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <span className="min-w-0 truncate text-sm font-bold">{label ?? placeholder}</span>
                <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="btn-ghost h-8 w-8 shrink-0 p-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[55vh] overflow-y-auto overscroll-contain p-1.5 pb-[max(env(safe-area-inset-bottom),0.375rem)]">
                {list}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
