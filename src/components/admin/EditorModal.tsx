"use client";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { ActionForm } from "./ActionForm";

/** Reusable "open modal with a form" button for admin CRUD pages. */
export function EditorModal({ trigger, title, action, children, triggerClass = "btn-secondary h-8 px-3 text-xs" }: { trigger: ReactNode; title: string; action: (fd: FormData) => Promise<{ ok?: boolean; error?: string } | void>; children: ReactNode; triggerClass?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>{trigger}</button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="card relative max-h-[90vh] w-full max-w-2xl animate-fade-up overflow-y-auto p-5 sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold">{title}</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
            </div>
            <ActionForm action={action} className="space-y-3" onDone={() => setOpen(false)}>
              {children}
              <div className="flex gap-2 pt-2">
                <button className="btn-primary">ذخیره</button>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost">انصراف</button>
              </div>
            </ActionForm>
          </div>
        </div>
      )}
    </>
  );
}
