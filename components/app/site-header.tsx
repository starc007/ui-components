import Link from "next/link";
import { Github } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-bg)/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-5 w-5 rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-violet)" />
          beUI <span className="text-(--color-fg-muted) font-normal">v2</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/components/primitives"
            className="rounded-md px-3 py-1.5 text-sm text-(--color-fg-muted) hover:text-(--color-fg) transition-colors"
          >
            Components
          </Link>
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-(--color-fg-muted) hover:text-(--color-fg) transition-colors"
          >
            <Github className="h-4 w-4" />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
