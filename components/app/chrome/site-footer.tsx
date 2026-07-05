import Link from "next/link";
import { GithubIcon } from "@/components/app/icons";
import { registry } from "@/lib/registry";

// The catalog keeps growing — the footer shows only the newest few per column.
const FOOTER_LIMIT = 8;

const allMotion = registry.find((c) => c.slug === "motion")?.components ?? [];
const allBlocks = registry.find((c) => c.slug === "blocks")?.components ?? [];
const motionComponents = allMotion.slice(-FOOTER_LIMIT).reverse();
const blockComponents = allBlocks.slice(-FOOTER_LIMIT).reverse();

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-4 pt-14 pb-10">
      <div className="mx-auto max-w-7xl">
        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <p className="font-pixel text-lg font-medium text-foreground">beUI</p>
            <p className="mt-2 max-w-[220px] text-sm leading-6 text-muted-foreground">
              The motion toolkit for React & Next.js. Copy-paste via shadcn registry.
            </p>
            <p className="mt-5 text-xs text-muted-foreground">
              Created by{" "}
              <Link
                href="https://x.com/saurra3h"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Saurabh
              </Link>
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="https://github.com/starc007/ui-components"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <GithubIcon className="h-4 w-4" />
              </Link>
              <Link
                href="https://x.com/saurra3h"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="X / Twitter"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Components */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Components
            </p>
            <ul className="space-y-2.5">
              {motionComponents.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/components/motion/${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/components/motion"
                  className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  View all ({allMotion.length})
                </Link>
              </li>
            </ul>
          </div>

          {/* Blocks */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Blocks
            </p>
            <ul className="space-y-2.5">
              {blockComponents.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/components/blocks/${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/components/blocks"
                  className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  View all ({allBlocks.length})
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Links
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="https://pro.beui.dev"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
                >
                  beUI Pro
                </Link>
              </li>
              <li>
                <Link
                  href="/components/motion"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Browse all
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/starc007/ui-components"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="/sponsors"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sponsor
                </Link>
              </li>
              <li>
                <Link
                  href="https://x.com/saurra3h"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  X / Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="/llms.txt"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  llms.txt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">© 2026 beUI. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
