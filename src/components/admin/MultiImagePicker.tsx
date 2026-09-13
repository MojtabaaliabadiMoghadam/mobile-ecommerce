"use client";
import { useState } from "react";
import { Image, Upload, X, Check, Loader2, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Img = { url: string; alt: string };
type Media = { id: number; url: string; originalName: string; alt: string | null };

export function MultiImagePicker({ value, onChange }: { value: Img[]; onChange: (v: Img[]) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/media");
      const d = await r.json();
      setItems(d.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = () => {
    setOpen(true);
    load();
  };

  const addImage = (url: string) => {
    if (!value.some((i) => i.url === url)) {
      onChange([...value, { url, alt: "" }]);
    }
    setOpen(false);
  };

  const uploadFiles = async (files: FileList) => {
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) return toast(d.error ?? "خطا در آپلود", "error");
      d.files.forEach((f: Media) => addImage(f.url));
      toast("تصویر آپلود و اضافه شد");
      await load();
    } catch {
      toast("خطا در آپلود", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((img, i) => (
          <div key={i} className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover" />
            {i === 0 && <span className="badge absolute right-1 top-1 bg-brand-600 text-white">اصلی</span>}
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 transition group-hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
            <input
              value={img.alt}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
              placeholder="متن alt"
              className="absolute inset-x-0 bottom-0 w-full bg-black/50 px-1.5 py-1 text-[10px] text-white placeholder:text-white/60"
            />
          </div>
        ))}
        <button type="button" onClick={openPicker} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700">
          <Image className="h-6 w-6" />
          <span className="text-[10px]">افزودن</span>
        </button>
      </div>

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
                <Upload className="h-4 w-4" /> {uploading ? "در حال آپلود..." : "آپلود تصویر"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
              </label>
            </div>
            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-6">
              {loading ? (
                <div className="col-span-full flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
              ) : (
                items.map((m) => (
                  <button key={m.id} type="button" onClick={() => addImage(m.url)} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt ?? m.originalName} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    {value.some((i) => i.url === m.url) && <span className="absolute inset-0 flex items-center justify-center bg-brand-600/50 text-white"><Check className="h-6 w-6" /></span>}
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
