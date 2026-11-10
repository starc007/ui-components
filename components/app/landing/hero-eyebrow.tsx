"use client";

import { BorderBeam } from "border-beam";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import { GithubIcon } from "@/components/app/icons";
import { Link } from "@/lib/navigation";

const LIBRARIES = [
  {
    platform: "web",
    href: "/components/motion",
    label: "React",
    repo: "https://github.com/starc007/ui-components",
    repoName: "beUI",
  },
  {
    platform: "native",
    href: "/react-native",
    label: "React Native",
    repo: "https://github.com/starc007/beui-native",
    repoName: "beUI Native",
  },
] as const;

const focus =
  "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

/**
 * Component counts for each library, variants included. A count opens that
 * platform's components; its GitHub icon opens the repository.
 */
export function HeroEyebrow({
  count,
  nativeCount,
}: {
  count: number;
  nativeCount: number;
}) {
  const t = useTranslations("Landing.hero");
  const reduceMotion = useReducedMotion();
  const counts = { web: count, native: nativeCount };

  return (
    <BorderBeam
      active={!reduceMotion}
      className="inline-block max-w-full rounded-full"
      colorVariant="colorful"
      duration={3}
      size="md"
      staticColors
      strength={1}
      saturation={1.5}
      theme="auto"
    >
      <div className="inline-flex items-center rounded-full border border-border bg-background p-0.5 text-xs">
        {LIBRARIES.map((library, index) => (
          <div key={library.platform} className="inline-flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="mx-1 h-4 w-px shrink-0 bg-border" />
            ) : null}
            <a
              href={library.repo}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t("repoOnGitHub", { name: library.repoName })}
              className={`inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground ${focus}`}
            >
              <GithubIcon className="size-4" />
            </a>
            <Link
              href={library.href}
              className={`-ml-1 inline-flex min-h-9 items-center rounded-full py-2 pr-3.5 pl-1.5 text-foreground transition-colors ${focus}`}
            >
              {/* One text run: flex would drop the space between items. */}
              <span>
                {t.rich("libraryCount", {
                  count: counts[library.platform],
                  library: library.label,
                  num: (chunks) => (
                    <span className="font-medium">{chunks}</span>
                  ),
                  muted: (chunks) => (
                    <span className="text-muted-foreground">{chunks}</span>
                  ),
                  sr: (chunks) => <span className="sr-only">{chunks}</span>,
                })}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </BorderBeam>
  );
}
