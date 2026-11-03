import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Slim footer that closes the content column on docs pages. */
export function DocsFooter() {
  const t = useTranslations("Chrome");
  // `page` links get the locale prefix; external URLs and machine endpoints
  // (RSS, llms.txt) are plain anchors.
  const links = [
    { href: "https://github.com/starc007/ui-components", label: "GitHub" },
    { href: "/changelog", label: t("docsPages.changelog"), page: true },
    { href: "/changelog/rss.xml", label: "RSS" },
    { href: "/docs/ai-agents", label: t("docsPages.forCodingAgents"), page: true },
    { href: "/llms.txt", label: "llms.txt" },
    { href: "/sponsors", label: t("footer.sponsor"), page: true },
  ];

  return (
    <footer className="mt-16 flex flex-col gap-4 border-t border-border pt-6 pb-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <Link prefetch={false} href="/" className="inline-flex items-center gap-2 text-foreground">
        <Image
          src="/beui-mark.png"
          alt=""
          width={20}
          height={20}
          className="size-5 rounded-md"
        />
        <span className="font-medium">beUI</span>
        <span className="hidden text-muted-foreground md:inline">{t("footer.docsTagline")}</span>
      </Link>
      <nav aria-label={t("footer.label")}>
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((item) => {
            const external = item.href.startsWith("http");
            return (
              <li key={item.href}>
                {item.page ? (
                  <Link prefetch={false} href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer noopener" : undefined}
                    className="transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}
