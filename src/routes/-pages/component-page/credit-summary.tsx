import { useLocale, useTranslations } from "use-intl";
import { EASE_OUT_CSS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { AVATAR_CLASS, FOCUS_RING } from "./credit-styles";
import type { CreditGroup } from "./types";

/** "Includes" so the title line doesn't claim designs others built. */
export function CreditSummary({ groups, className }: { groups: CreditGroup[]; className?: string }) {
  const t = useTranslations("Docs.component");
  const locale = useLocale();
  const parts = new Intl.ListFormat(locale, { type: "conjunction" }).formatToParts(
    groups.map(({ credit }) => credit.name),
  );
  let next = 0;
  return (
    <p className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span aria-hidden="true" className="flex shrink-0">
        {groups.slice(0, 2).map(({ credit }, index) =>
          credit.avatar ? (
            <img
              key={credit.url}
              src={credit.avatar}
              alt=""
              width={20}
              height={20}
              className={cn(AVATAR_CLASS, "ring-2 ring-background", index > 0 && "-ml-1.5")}
            />
          ) : null,
        )}
      </span>
      <span>
        {t("includesDesignsBy")}{" "}
        {parts.map((part, index) => {
          if (part.type !== "element") {
            // biome-ignore lint/suspicious/noArrayIndexKey: parts are positional
            return <span key={index}>{part.value}</span>;
          }
          const group = groups[next++];
          return (
            <a
              key={group.credit.url}
              href={`#${group.examples[0].slug}`}
              className={cn(
                "rounded-sm font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground",
                FOCUS_RING,
              )}
              style={{ transitionTimingFunction: EASE_OUT_CSS }}
            >
              {part.value}
            </a>
          );
        })}
      </span>
    </p>
  );
}
