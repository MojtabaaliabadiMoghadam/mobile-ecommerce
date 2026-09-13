"use client";
import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

type Result = { ok?: boolean; error?: string } | void;

export function ActionForm({ action, children, className = "", success = "ذخیره شد", onDone }: { action: (fd: FormData) => Promise<Result>; children: ReactNode; className?: string; success?: string; onDone?: () => void }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <form
      className={className}
      action={(fd) =>
        start(async () => {
          const r = await action(fd);
          if (r && "error" in r && r.error) return toast(r.error, "error");
          toast(success);
          router.refresh();
          onDone?.();
        })
      }
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
    </form>
  );
}

export function ActionButton({ action, children, className = "btn-ghost h-8 w-8 p-0 text-rose-500", confirmText = "آیا مطمئن هستید؟", success = "انجام شد" }: { action: () => Promise<Result>; children: ReactNode; className?: string; confirmText?: string | null; success?: string }) {
  const [pending, start] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => {
        if (confirmText && !confirm(confirmText)) return;
        start(async () => {
          const r = await action();
          if (r && "error" in r && r.error) return toast(r.error, "error");
          toast(success);
          router.refresh();
        });
      }}
    >
      {children}
    </button>
  );
}
