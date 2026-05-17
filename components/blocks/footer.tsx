import Link from "next/link";
import { cn } from "@/lib/cn";

export type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export interface FooterProps {
  brand?: string;
  tagline?: string;
  columns?: FooterColumn[];
  bottom?: string;
  className?: string;
}

export function Footer({
  brand = "beUI",
  tagline = "Open source UI components for React.",
  columns = [],
  bottom = `© ${new Date().getFullYear()} beUI. All rights reserved.`,
  className,
}: FooterProps) {
  return (
    <footer className={cn("border-t border-(--color-border) bg-(--color-bg)", className)}>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[2fr_3fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-5 w-5 rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-violet)" />
            <span className="font-semibold tracking-tight text-(--color-fg)">{brand}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-(--color-fg-muted)">{tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)">{col.title}</h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-(--color-fg) hover:text-(--color-accent) transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-(--color-border)">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-(--color-fg-muted)">{bottom}</div>
      </div>
    </footer>
  );
}
