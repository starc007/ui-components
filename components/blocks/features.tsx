import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  span?: "1" | "2";
};

export interface FeaturesProps {
  title?: string;
  description?: string;
  features: Feature[];
  className?: string;
}

export function Features({ title, description, features, className }: FeaturesProps) {
  return (
    <section className={cn("px-4 py-20", className)}>
      <div className="mx-auto max-w-6xl">
        {title || description ? (
          <div className="mb-12 max-w-2xl">
            {title ? (
              <h2 className="text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">{title}</h2>
            ) : null}
            {description ? <p className="mt-3 text-(--color-fg-muted)">{description}</p> : null}
          </div>
        ) : null}

        <div className="grid auto-rows-[180px] grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 transition-colors hover:border-(--color-border-strong)",
                  f.span === "2" && "md:col-span-2",
                )}
              >
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), color-mix(in oklch, var(--color-accent) 12%, transparent), transparent 40%)",
                  }}
                />
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-accent)">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-(--color-fg)">{f.title}</h3>
                <p className="mt-1.5 text-sm text-(--color-fg-muted)">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
