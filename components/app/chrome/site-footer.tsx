import { Mail } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useTranslations } from "use-intl";
import { GithubIcon } from "@/components/app/icons";
import { Tooltip } from "@/components/motion/tooltip";
import { categoryPath, NATIVE_PATH } from "@/lib/component-paths";
import { Link } from "@/lib/navigation";

const GITHUB_URL = "https://github.com/starc007/ui-components";
const NATIVE_GITHUB_URL = "https://github.com/starc007/beui-native";
const X_URL = "https://x.com/saurra3h";
const EMAIL = "saurabh10102@gmail.com";
const PRO_URL =
  "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=footer";

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

const LEGAL_PAGES = ["privacy", "terms", "refunds"] as const;

// A constant, not `new Date()`: prerendered HTML and the client must render the same year.
const COPYRIGHT_YEAR = 2026;

type FooterLink = { href: string; label: string };

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className="size-4">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

/**
 * Site pages go through the router; anything else is a plain anchor, new tab
 * if off-site. Other props (a tooltip's ref and aria) reach the anchor.
 */
function FooterAnchor({
  href,
  children,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { href: string; children: ReactNode }) {
  if (href.startsWith("/") && !href.includes(".")) {
    return (
      <Link prefetch={false} href={href} {...props}>
        {children}
      </Link>
    );
  }
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      {...props}
    >
      {children}
    </a>
  );
}

const LINK = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const ICON_BUTTON =
  "grid size-9 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

/**
 * The site footer: the brand with social links, four short link columns, and
 * a bottom bar with legal links and our other products, over the coastal
 * sketch. Individual components are linked from the sidebar, category pages
 * and sitemap, not from here.
 */
export function SiteFooter() {
  const t = useTranslations("Chrome");

  const columns: { id: string; title: string; links: FooterLink[] }[] = [
    {
      id: "library",
      title: t("footer.columns.library"),
      links: [
        { href: categoryPath("motion"), label: t("header.components") },
        { href: categoryPath("blocks"), label: t("header.blocks") },
        { href: categoryPath("agents"), label: t("header.agents") },
        { href: categoryPath("charts"), label: t("header.charts") },
        { href: categoryPath("micro-interactions"), label: t("header.micro-interactions") },
        { href: categoryPath("sounds"), label: t("header.sounds") },
        { href: categoryPath("casino"), label: t("header.casino") },
        { href: NATIVE_PATH, label: t("header.reactNative") },
      ],
    },
    {
      id: "learn",
      title: t("footer.columns.learn"),
      links: [
        { href: "/docs/motion-patterns", label: t("header.motionGuides") },
        { href: "/guides", label: t("header.howToGuides") },
        { href: "/docs/theme", label: t("docsPages.theming") },
        { href: "/alternatives", label: t("footer.compare") },
        { href: "/blog", label: t("footer.blog") },
        { href: "/changelog", label: t("header.changelog") },
      ],
    },
    {
      id: "agents",
      title: t("footer.columns.agents"),
      links: [
        { href: "/docs/ai-agents", label: t("footer.agentGuide") },
        { href: "/docs/ai-agents#mcp-server", label: t("footer.mcpServer") },
        { href: "/llms.txt", label: "llms.txt" },
      ],
    },
    {
      id: "beui",
      title: t("footer.columns.beui"),
      links: [
        { href: PRO_URL, label: "beUI Pro" },
        { href: "/playground", label: t("header.playground") },
        { href: "/themes", label: t("header.themes") },
        { href: GITHUB_URL, label: t("footer.githubWeb") },
        { href: NATIVE_GITHUB_URL, label: t("footer.githubNative") },
        { href: "/sponsors", label: t("footer.sponsor") },
        { href: `mailto:${EMAIL}`, label: t("footer.contact") },
      ],
    },
  ];

  const socials = [
    { href: X_URL, label: "X", icon: <XIcon /> },
    { href: GITHUB_URL, label: "GitHub", icon: <GithubIcon className="size-4" /> },
    { href: `mailto:${EMAIL}`, label: t("footer.email"), icon: <Mail aria-hidden="true" className="size-4" /> },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t border-border/60">
      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-8 gap-y-10 px-4 pt-14 pb-48 sm:pb-64 md:grid-cols-4 lg:grid-cols-[1.6fr_repeat(4,minmax(0,1fr))]">
        {/* Brand: its own row until the columns fit beside it. */}
        <div className="col-span-2 max-w-xs md:col-span-4 lg:col-span-1">
          <Link prefetch={false} href="/" className="inline-flex items-center gap-2.5">
            <img src="/beui-mark.png" alt="" width={28} height={28} className="size-7 rounded-full" />
            <span className="text-lg font-medium tracking-[-0.01em] text-foreground">beUI</span>
          </Link>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("footer.description")}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.rich("footer.createdBy", {
              link: (chunks) => (
                <a
                  href={X_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-foreground underline-offset-4 transition-colors hover:underline"
                >
                  {chunks}
                </a>
              ),
            })}
          </p>
          <ul className="mt-3 -ml-2 flex items-center gap-0.5">
            {socials.map((social) => (
              <li key={social.label}>
                <Tooltip content={social.label} side="top">
                  <FooterAnchor href={social.href} className={ICON_BUTTON}>
                    {social.icon}
                    <span className="sr-only">{social.label}</span>
                  </FooterAnchor>
                </Tooltip>
              </li>
            ))}
          </ul>
        </div>

        {columns.map((column) => (
          <nav key={column.id} aria-label={column.title}>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <FooterAnchor href={link.href} className={LINK}>
                    {link.label}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Copyright and legal on the left, our other products on the right. */}
        <div className="col-span-full flex flex-col gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>{t("footer.copyright", { year: COPYRIGHT_YEAR })}</p>
            <nav aria-label={t("footer.legal")}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {LEGAL_PAGES.map((page) => (
                  <li key={page}>
                    <Link prefetch={false} href={`/${page}`} className="transition-colors hover:text-foreground">
                      {t(`footer.${page}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <nav aria-label={t("footer.alsoByUs")} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{t("footer.alsoByUs")}:</span>
            <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {PRODUCTS.map((product) => (
                <li key={product.href}>
                  <a
                    href={product.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {product.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Match the artwork height to the grid's bottom padding so it never sits behind links. */}
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
