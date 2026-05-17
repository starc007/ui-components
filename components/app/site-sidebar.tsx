"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/lib/registry";
import { cn } from "@/lib/utils";

export function SiteSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-(--color-border) py-6 pr-4 md:block">
      <nav className="flex flex-col gap-6">
        {registry.map((cat) => (
          <div key={cat.slug}>
            <Link
              href={`/components/${cat.slug}`}
              className="mb-2 block px-2 text-xs font-semibold uppercase tracking-wider text-(--color-fg-muted)"
            >
              {cat.name}
            </Link>
            <ul className="flex flex-col gap-px">
              {cat.components.map((comp) => {
                const href = `/components/${cat.slug}/${comp.slug}`;
                const active = pathname === href;
                return (
                  <li key={comp.slug}>
                    <Link
                      href={href}
                      className={cn(
                        "block rounded-md px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-(--color-bg-elev) text-(--color-fg) font-medium"
                          : "text-(--color-fg-muted) hover:text-(--color-fg) hover:bg-(--color-bg-elev)/60",
                      )}
                    >
                      {comp.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
