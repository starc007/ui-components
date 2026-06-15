"use client";

import { ThemeToggle, type ThemeVariant } from "@/components/motion/theme-toggle";

const VARIANTS: { variant: ThemeVariant; label: string }[] = [
  { variant: "rectangle", label: "Rectangle" },
  { variant: "circle", label: "Circle" },
  { variant: "circle-blur", label: "Circle blur" },
];

export function ThemeTogglePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-5">
      {VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <ThemeToggle
            variant={variant}
            start="bottom-up"
            className="rounded-xl border border-border bg-background p-2.5"
            iconClassName="h-5 w-5"
          />
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
