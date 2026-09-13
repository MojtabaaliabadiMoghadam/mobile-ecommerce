"use client";
import { useCallback, useRef, useState, useTransition } from "react";
import { Upload, Trash2, Search, Copy, Check, Loader2 } from "lucide-react";
import { deleteMedia, updateMediaAlt } from "@/app/actions/admin";
import { useToast } from "@/components/ui/Toast";
import { formatNumber, formatDateShort } from "@/lib/utils";
import type { MediaItem } from "@/db/schema";

export function MediaLibrary({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = items.filter((m) => m.originalName.toLowerCase().includes(q.toLowerCase()) || m.url.toLowerCase().includes(q.toLowerCase()));

  const upload = useCallback(async (files: FileList) => {
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    try {
      const r = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const d = await r.json();
      if (!r.ok) return toast(d.error ?? "خطا در آپلود", "error");
      setItems((prev) => [...d.files, ...prev]);
      toast(`${d.files.length} تصویر آپلود شد`);
    } catch {
      toast("خطا در آپلود", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [toast]);

  const copy = (url: string, id: number) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id);
      toast("آدرس تصویر کپی شد");
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const remove = (id: number) => {
    if (!confirm("تصویر حذف شود؟")) return;
    start(async () => {
      await deleteMedia(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      toast("تصویر حذف شد");
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در تصاویر..." className="input pr-9" />
        </div>
        <label className="btn-primary cursor-pointer shrink-0">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "در حال آپلود..." : "آپلود تصاویر جدید"}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((m) => (
          <div key={m.id} className="card group overflow-hidden">
            <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? m.originalName} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium" title={m.originalName}>{m.originalName}</p>
              <p className="mt-0.5 text-[10px] text-slate-400" dir="ltr">{m.url}</p>
              <div className="mt-2 flex items-center gap-1">
                <button onClick={() => copy(m.url, m.id)} className="btn-ghost h-7 flex-1 rounded-lg px-1 text-[11px]" title="کپی آدرس">
                  {copied === m.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} کپی
                </button>
                <button onClick={() => remove(m.id)} disabled={pending} className="btn-ghost h-7 w-7 rounded-lg p-0 text-rose-500" aria-label="حذف">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="card py-16 text-center text-sm text-slate-400">تصویری یافت نشد</div>}
    </div>
  );
}
