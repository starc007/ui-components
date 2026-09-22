import Image from "next/image";
import Link from "next/link";
import { categoryPath, componentPath } from "@/lib/component-paths";
import { registry } from "@/lib/registry";

const FOOTER_LIMIT = 7;
const COLUMNS = [
  { category: "motion", title: "Components" },
  { category: "blocks", title: "Blocks" },
  { category: "agents", title: "AI Agents" },
  { category: "charts", title: "Charts" },
].map(({ category, title }) => {
  const components =
    registry.find((entry) => entry.slug === category)?.components ?? [];
  return {
    category,
    title,
    total: components.length,
    items: components.slice(0, FOOTER_LIMIT),
  };
});

const LINKS = [
  { href: "/components/motion", label: "Browse all" },
  { href: "/playground", label: "Playground" },
  { href: "https://github.com/starc007/ui-components", label: "GitHub" },
  { href: "/docs/ai-agents", label: "For coding agents" },
  { href: "/docs/theme", label: "Theming" },
  { href: "/docs/motion-patterns", label: "Motion patterns" },
  { href: "/sponsors", label: "Sponsor beUI" },
  { href: "/llms.txt", label: "llms.txt" },
  {
    href: "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=footer",
    label: "beUI Pro",
  },
  { href: "https://usemarkd.app", label: "Markd" },
  {
    href: "https://tracwell.app/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=landing_footer",
    label: "Tracwell",
  },
];

export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-border/60 border-t">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-x-8 gap-y-12 px-4 pt-16 pb-48 sm:pb-64 sm:grid-cols-2 md:grid-cols-[1.4fr_repeat(5,1fr)]">
        {/* Brand. */}
        <div className="max-w-xs">
          <Link
            prefetch={false}
            href="/"
            className="inline-flex items-center gap-2.5"
          >
            <Image
              src="/beui-mark.png"
              alt=""
              width={30}
              height={30}
              className="size-[30px] rounded-full"
            />
            <span className="font-semibold text-lg text-foreground tracking-[-0.01em]">
              beUI
            </span>
          </Link>
          <p className="mt-4 text-muted-foreground text-sm leading-6">
            Free motion components, blocks, agent interfaces, and charts for
            React — delivered as source through the shadcn registry.
          </p>
          <p className="mt-4 text-muted-foreground text-sm">
            Created by <span className="text-foreground">Saurabh</span>
          </p>
          <div className="mt-4 flex items-center gap-1.5">
            <a
              href="https://x.com/saurra3h"
              target="_blank"
              rel="noreferrer noopener"
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="sr-only">X / Twitter</span>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
                className="size-4"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            <a
              href="mailto:saurabh10102@gmail.com"
              className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="sr-only">Email</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden="true"
                focusable="false"
                className="size-4"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
            </a>
          </div>
        </div>

        {/* Registry item columns. */}
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
              {column.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => (
                <li key={item.slug}>
                  <Link
                    prefetch={false}
                    href={componentPath(column.category, item.slug)}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {column.total > column.items.length ? (
                <li>
                  <Link
                    prefetch={false}
                    href={categoryPath(column.category)}
                    className="font-medium text-foreground text-sm transition-colors hover:text-muted-foreground"
                  >
                    View all ({column.total})
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ))}

        {/* Links. */}
        <nav aria-label="Links">
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
            Links
          </p>
          <ul className="mt-4 space-y-2.5">
            {LINKS.map((item) => {
              const external = item.href.startsWith("http");
              return (
                <li key={item.href}>
                  <Link
                    prefetch={false}
                    href={item.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer noopener" : undefined}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Match the artwork height to the grid’s bottom padding so it never sits behind links. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 [mask-image:linear-gradient(to_bottom,transparent,black_80%)] sm:h-64"
      >
        <Image
          src="/landing/coastal-sketch.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom dark:brightness-50"
        />
      </div>
    </footer>
  );
}
