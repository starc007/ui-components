"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

export type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const icons: Record<ToastVariant, ReactNode> = {
  default: null,
  success: <CheckCircle2 className="h-4 w-4 text-(--color-success)" />,
  warning: <AlertTriangle className="h-4 w-4 text-(--color-warning)" />,
  danger: <XCircle className="h-4 w-4 text-(--color-danger)" />,
  info: <Info className="h-4 w-4 text-(--color-accent)" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const toast: Toast = { duration: 4000, variant: "default", ...t, id };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration) setTimeout(() => dismiss(id), toast.duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Viewport />
    </ToastContext.Provider>
  );
}

function Viewport() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-elev) p-3 shadow-2xl shadow-black/30",
            )}
          >
            {icons[t.variant ?? "default"]}
            <div className="flex-1">
              <p className="text-sm font-medium text-(--color-fg)">{t.title}</p>
              {t.description ? <p className="mt-0.5 text-xs text-(--color-fg-muted)">{t.description}</p> : null}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-(--color-fg-muted) hover:text-(--color-fg)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
