import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SPONSORS } from "./landing-data";

/** Diamond sponsors as one quiet row of wordmarks. */
export function SponsorRow({
  placement,
  className,
}: {
  /** UTM content tag, so each variant's clicks stay separable. */
  placement: string;
  className?: string;
}) {
  const t = useTranslations("Landing.home");
  return (
    <section
      aria-labelledby={`sponsors-${placement}`}
      className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}
    >
      <h2
        id={`sponsors-${placement}`}
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
      >
        {t("sponsoredBy")}
      </h2>
      {SPONSORS.map((sponsor) => (
        <a
          key={sponsor.domain}
          href={`https://${sponsor.domain}/?utm_source=beui&utm_medium=referral&utm_campaign=sponsorship&utm_content=${placement}`}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-lg px-1 py-1 text-foreground opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Image
            src={`/sponsors/${sponsor.icon}-light.svg`}
            alt=""
            width={20}
            height={20}
            className="size-5 dark:hidden"
          />
          <Image
            src={`/sponsors/${sponsor.icon}-dark.svg`}
            alt=""
            width={20}
            height={20}
            className="hidden size-5 dark:block"
          />
          <span className="text-[15px] font-semibold tracking-tight">{sponsor.name}</span>
        </a>
      ))}
    </section>
  );
}
