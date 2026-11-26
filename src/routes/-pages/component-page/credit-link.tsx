import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "use-intl";
import { EASE_OUT_CSS } from "@/lib/ease";
import type { ComponentCredit } from "@/lib/registry";
import { cn } from "@/lib/utils";
import { AVATAR_CLASS, FOCUS_RING } from "./credit-styles";

export function CreditLink({ credit, className }: { credit: ComponentCredit; className?: string }) {
  const t = useTranslations("Docs.component");
  const url = new URL(credit.url);
  url.searchParams.set("ref", "beui");
  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group -ml-1 inline-flex items-center gap-2 rounded-full py-1 pr-2.5 pl-1 text-sm text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.06] hover:text-foreground",
        FOCUS_RING,
        className,
      )}
      style={{ transitionTimingFunction: EASE_OUT_CSS }}
    >
      {credit.avatar ? (
        <img src={credit.avatar} alt="" width={20} height={20} className={AVATAR_CLASS} />
      ) : null}
      <span>
        {t("contributedBy")}{" "}
        <span className="font-medium text-foreground">{credit.name}</span>
      </span>
      <ArrowUpRight
        aria-hidden="true"
        strokeWidth={1.5}
        className="size-3.5 shrink-0 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none"
        style={{ transitionTimingFunction: EASE_OUT_CSS }}
      />
      <span className="sr-only">{t("opensInNewTab")}</span>
    </a>
  );
}
