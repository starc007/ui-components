import { useTranslations } from "use-intl";
import { Link } from "@/lib/navigation";
import { categoryPath, componentPath } from "@/lib/component-paths";
import { registry } from "@/lib/registry";

const FOOTER_LIMIT = 7;
const COLUMNS = ["motion", "blocks", "agents", "charts", "casino"].flatMap((slug) => {
  const category = registry.find((entry) => entry.slug === slug);
  return category ? [category] : [];
});

const PRODUCTS = [
  {
    href: "https://tracwell.app/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=landing_footer",
    label: "Tracwell",
  },
  {
    href: "https://pulsemac.app/?utm_source=beui&utm_medium=referral&utm_campaign=pulse_launch&utm_content=footer",
    label: "Pulse",
  },
  { href: "https://usemarkd.app", label: "Markd" },
  { href: "https://dotsafe.dev", label: "Dotsafe" },
];

export function SiteFooter() {
  const t = useTranslations("Chrome");
  // `page` links go through the router; external URLs and llms.txt are plain anchors.
  const links = [
    { href: "/components/motion", label: t("footer.browseAll"), page: true },
    { href: "/playground", label: t("header.playground"), page: true },
    { href: "/changelog", label: t("docsPages.changelog"), page: true },
    { href: "https://github.com/starc007/ui-components", label: "GitHub" },
    { href: "/docs/ai-agents", label: t("docsPages.forCodingAgents"), page: true },
    { href: "/docs/theme", label: t("docsPages.theming"), page: true },
    { href: "/docs/motion-patterns", label: t("docsPages.motionPatterns"), page: true },
    { href: "/guides", label: t("footer.guides"), page: true },
    { href: "/alternatives", label: t("footer.compare"), page: true },
    { href: "/sponsors", label: t("footer.sponsor"), page: true },
    { href: "/llms.txt", label: "llms.txt" },
    {
      href: "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=footer",
      label: "beUI Pro",
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-border/60 border-t">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-x-6 gap-y-12 px-4 pt-16 pb-48 sm:pb-64 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[1.4fr_repeat(7,minmax(0,1fr))]">
        {/* Brand. */}
        <div className="max-w-xs">
          <Link
            prefetch={false}
            href="/"
            className="inline-flex items-center gap-2.5"
          >
            <img
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
            {t("footer.description")}
          </p>
          <p className="mt-4 text-muted-foreground text-sm">
            {t.rich("footer.createdBy", {
              link: (chunks) => <span className="text-foreground">{chunks}</span>,
            })}
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
              <span className="sr-only">{t("dock.email")}</span>
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
          <nav key={column.slug} aria-label={column.name}>
            <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
              {column.name}
            </p>
            <ul className="mt-4 space-y-2.5">
              {column.components.slice(0, FOOTER_LIMIT).map((item) => (
                <li key={item.slug}>
                  <Link
                    prefetch={false}
                    href={componentPath(column.slug, item.slug)}
                    className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {column.components.length > FOOTER_LIMIT ? (
                <li>
                  <Link
                    prefetch={false}
                    href={categoryPath(column.slug)}
                    className="font-medium text-foreground text-sm transition-colors hover:text-muted-foreground"
                  >
                    {t("footer.viewAll", { count: column.components.length })}
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        ))}

        {/* Links. */}
        <nav aria-label={t("footer.links")}>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
            {t("footer.links")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {links.map((item) => {
              const external = item.href.startsWith("http");
              const className = "text-muted-foreground text-sm transition-colors hover:text-foreground";
              return (
                <li key={item.href}>
                  {item.page ? (
                    <Link prefetch={false} href={item.href} className={className}>
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer noopener" : undefined}
                      className={className}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <nav aria-label={t("footer.alsoByUs")}>
          <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
            {t("footer.alsoByUs")}
          </p>
          <ul className="mt-4 space-y-2.5">
            {PRODUCTS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground text-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Match the artwork height to the grid’s bottom padding so it never sits behind links. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 [mask-image:linear-gradient(to_bottom,transparent,black_80%)] sm:h-64"
      >
        <img
          src="/landing/coastal-sketch.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover object-bottom dark:brightness-50"
        />
      </div>
    </footer>
  );
}
