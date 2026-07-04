"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { registry } from "@/lib/registry";
import { NewBadge } from "@/components/app/docs/new-badge";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { cn } from "@/lib/utils";

const INTRO = [
  { slug: "home", name: "Home", href: "/components/motion" },
  { slug: "ai-agents", name: "AI Agents", href: "/docs/ai-agents" },
];

const PATTERNS = [
  { slug: "motion-patterns", name: "Motion Guides", href: "/docs/motion-patterns" },
];

function moveFirstItemsToBottom<T>(items: T[], count: number) {
  return [...items.slice(count), ...items.slice(0, count)];
}

/** Nav list shared by the desktop sidebar and the mobile bottom sheet. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    cn(
      "relative block rounded-lg px-3 py-1.5 text-sm transition-colors",
      active
        ? "text-foreground font-medium bg-foreground/[0.06]"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <nav className="flex flex-col gap-8">
      <div>
        <p className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Intro
        </p>
        <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
          {INTRO.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              onClick={onNavigate}
              className={linkClass(pathname === item.href)}
            >
              {item.name}
            </Link>
          ))}
        </SharedLayoutBg>
      </div>
      <div>
        <p className="mb-2 block px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Guides
        </p>
        <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
          {PATTERNS.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              onClick={onNavigate}
              className={linkClass(pathname === item.href)}
            >
              {item.name}
            </Link>
          ))}
        </SharedLayoutBg>
      </div>
      {registry.map((cat) => (
        <div key={cat.slug}>
          <Link
            href={`/components/${cat.slug}`}
            onClick={onNavigate}
            className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            {cat.name}
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/[0.06] px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
              {cat.components.length}
            </span>
          </Link>
          <SharedLayoutBg inset={0} pillClassName="rounded-lg bg-foreground/[0.05]">
            {moveFirstItemsToBottom(cat.components, 3).map((comp) => {
              const href = `/components/${cat.slug}/${comp.slug}`;
              return (
                <Link
                  key={comp.slug}
                  href={href}
                  onClick={onNavigate}
                  className={linkClass(pathname === href)}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{comp.name}</span>
                    {comp.badge === "new" ? <NewBadge /> : null}
                  </span>
                </Link>
              );
            })}
          </SharedLayoutBg>
        </div>
      ))}
    </nav>
  );
}

export function SiteSidebar() {
  return (
    <aside className="fixed top-14 hidden h-[calc(100vh-3.5rem)] w-60 overflow-x-visible overflow-y-auto scrollbar-hide py-6 pr-4 md:block">
      <SidebarNav />
    </aside>
  );
}
