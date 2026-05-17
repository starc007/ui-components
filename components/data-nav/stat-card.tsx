import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { cn } from "@/lib/cn";

export interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  delta?: number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, format, delta, hint, icon: Icon, className }: StatCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-(--color-fg-muted)">{label}</span>
        {Icon ? <Icon className="h-4 w-4 text-(--color-fg-muted)" /> : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <AnimatedNumber value={value} format={format} className="text-2xl font-semibold text-(--color-fg)" />
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
              up
                ? "bg-(--color-success)/15 text-(--color-success)"
                : "bg-(--color-danger)/15 text-(--color-danger)",
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-(--color-fg-muted)">{hint}</p> : null}
    </div>
  );
}
