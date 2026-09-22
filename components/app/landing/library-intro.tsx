import {
  ArrowUpRight,
  Blocks,
  ChartNoAxesCombined,
  Component,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";

const COLLECTIONS = [
  { name: "Components", href: "/components/motion", icon: Component },
  { name: "Blocks", href: "/components/blocks", icon: Blocks },
  { name: "AI Agents", href: "/components/agents", icon: MessagesSquare },
  { name: "Charts", href: "/charts", icon: ChartNoAxesCombined },
];

export function LibraryIntro() {
  return (
    <nav
      aria-label="Explore the library"
      className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16"
    >
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {COLLECTIONS.map(({ name, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group grid min-w-0 grid-cols-[1fr_auto] items-center gap-3 bg-background p-4 transition-colors duration-150 hover:bg-card focus-visible:z-10 focus-visible:bg-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0285f7] sm:flex sm:gap-4 sm:p-5"
          >
            <span className="col-span-2 flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground transition-colors duration-150 group-hover:bg-[#0285f7]/10 group-hover:text-[#0285f7] group-focus-visible:bg-[#0285f7]/10 group-focus-visible:text-[#0285f7]">
              <Icon
                aria-hidden="true"
                className="size-[18px]"
                strokeWidth={1.5}
              />
            </span>
            <span className="text-sm font-medium text-foreground">{name}</span>
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground/60 transition-colors duration-150 group-hover:text-foreground group-focus-visible:text-foreground sm:ml-auto"
              strokeWidth={1.5}
            />
          </Link>
        ))}
      </div>
    </nav>
  );
}
