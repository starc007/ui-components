import Link from "next/link";
import { GithubIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-5 w-5 rounded-md bg-gradient-to-br from-brand-accent to-brand-violet" />
          beUI <span className="text-muted-foreground font-normal">v2</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/components/motion"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Components
          </Link>
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          >
            <GithubIcon className="h-4 w-4" />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
