"use client";
import { useCallback, useEffect, useState } from "react";
import { Image, Upload, X, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Media = { id: number; url: string; originalName: string; alt: string | null; mimeType: string };

/**
 * یک دکمه‌ی انتخاب تصویر که مدیال گالریِ تصاویر آپلودشده را باز می‌کند.
 * به‌جای هاردکد کردن آدرس، آدرس انتخاب‌شده از کتابخانه‌ی تصاویر می‌آید.
 */
export function MediaPicker({
  value,
  onSelect,
  label = "انتخاب تصویر",
}: {
  value?: string | null;
  onSelect: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/media");
      const d = await r.json();
      setItems(d.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openPicker = () => {
    setOpen(true);
    load();
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) toast(d.error ?? "خطا در آپلود", "error");
      else toast("تصویر آپلود شد");
      await load();
    } catch {
      toast("خطا در آپلود", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Preview + trigger button */}
      <button type="button" onClick={openPicker} className="group relative flex h-36 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="relative z-10 rounded-lg bg-black/50 px-3 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">تغییر تصویر</span>
          </>
        ) : (
          <>
            <Image className="h-8 w-8" />
            <span className="text-xs">{label}</span>
          </>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-t-2xl bg-white dark:bg-slate-900 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
              <h3 className="font-bold">کتابخانه تصاویر</h3>
              <button onClick={() => setOpen(false)} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <label className="btn-primary cursor-pointer">
                <Upload className="h-4 w-4" />
                {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
              </label>
              <span className="text-xs text-slate-400">فرمت‌های JPG ،PNG ،WebP — حداکثر ۱۰ مگابایت</span>
            </div>

            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : items.length === 0 ? (
                <div className="col-span-full py-10 text-center text-sm text-slate-400">هنوز تصویری آپلود نشده است</div>
              ) : (
                items.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onSelect(m.url);
                      setOpen(false);
                    }}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                    title={m.originalName}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt ?? m.originalName} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    {value === m.url && <span className="absolute inset-0 flex items-center justify-center bg-brand-600/50 text-white"><Check className="h-6 w-6" /></span>}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
