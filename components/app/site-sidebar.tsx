"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/lib/registry";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { cn } from "@/lib/utils";

const INTRO = [
  { slug: "ai-agents", name: "AI Agents", href: "/docs/ai-agents" },
];

export function SiteSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed top-14 hidden h-[calc(100vh-3.5rem)] w-60 overflow-x-visible overflow-y-auto py-6 pr-4 md:block">
      <nav className="flex flex-col gap-8">
        <div>
          <p className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-(--color-fg-muted)">
            Intro
          </p>
          <SharedLayoutBg
            inset={0}
            pillClassName="rounded-lg bg-(--color-fg)/[0.05]"
          >
            {INTRO.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={cn(
                    "relative block rounded-lg px-3 py-1.5 text-sm transition-colors",
                    active
                      ? "text-(--color-fg) font-medium bg-(--color-fg)/[0.06]"
                      : "text-(--color-fg-muted) hover:text-(--color-fg)",
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </SharedLayoutBg>
        </div>
        {registry.map((cat) => (
          <div key={cat.slug}>
            <Link
              href={`/components/${cat.slug}`}
              className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-(--color-fg-muted)"
            >
              {cat.name}
            </Link>
            <SharedLayoutBg
              inset={0}
              pillClassName="rounded-lg bg-(--color-fg)/[0.05]"
            >
              {cat.components.map((comp) => {
                const href = `/components/${cat.slug}/${comp.slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={comp.slug}
                    href={href}
                    className={cn(
                      "relative block rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "text-(--color-fg) font-medium bg-(--color-fg)/[0.06]"
                        : "text-(--color-fg-muted) hover:text-(--color-fg)",
                    )}
                  >
                    {comp.name}
                  </Link>
                );
              })}
            </SharedLayoutBg>
          </div>
        ))}
      </nav>
    </aside>
  );
}
