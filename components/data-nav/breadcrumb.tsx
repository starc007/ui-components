import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/cn";

export type Crumb = { label: string; href?: string };

export interface BreadcrumbProps {
  items: Crumb[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {c.href && !last ? (
              <Link href={c.href} className="text-(--color-fg-muted) hover:text-(--color-fg) transition-colors">
                {c.label}
              </Link>
            ) : (
              <span className={last ? "text-(--color-fg) font-medium" : "text-(--color-fg-muted)"}>{c.label}</span>
            )}
            {!last ? <ChevronRight className="h-3.5 w-3.5 text-(--color-fg-muted)" /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
