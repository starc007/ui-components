import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "https://github.com/starc007/ui-components", label: "GitHub" },
  { href: "/changelog", label: "Changelog" },
  { href: "/changelog/rss.xml", label: "RSS" },
  { href: "/docs/ai-agents", label: "For coding agents" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/sponsors", label: "Sponsor" },
];

/** Slim footer that closes the content column on docs pages. */
export function DocsFooter() {
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
        <span className="hidden text-muted-foreground md:inline">The motion toolkit for React & Next.js</span>
      </Link>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {LINKS.map((item) => {
            const external = item.href.startsWith("http");
            return (
              <li key={item.href}>
                <Link
                  prefetch={false}
                  href={item.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer noopener" : undefined}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}
