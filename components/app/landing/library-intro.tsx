import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const COLLECTIONS = [
  {
    name: "Components",
    detail: "The everyday details",
    href: "/components/motion",
  },
  {
    name: "Blocks",
    detail: "More of your product, ready",
    href: "/components/blocks",
  },
  {
    name: "AI Agents",
    detail: "Interfaces for the conversation",
    href: "/components/agents",
  },
  { name: "Charts", detail: "Give your data some life", href: "/charts" },
];

export function LibraryIntro() {
  return (
    <nav
      aria-label="Explore the library"
      className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16"
    >
      <div className="grid grid-cols-2 border-y border-border lg:grid-cols-4">
        {COLLECTIONS.map(({ name, detail, href }) => (
          <Link
            key={href}
            href={href}
            className="group min-w-0 px-3 py-6 transition-colors hover:bg-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6 sm:py-7"
          >
            <span className="flex items-center justify-between gap-3 text-sm font-medium text-foreground">
              {name}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground group-hover:text-[#0285f7]"
              />
            </span>
            <span className="mt-2 block text-pretty text-xs leading-5 text-muted-foreground">
              {detail}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
