import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

const OPTIONS = [
  {
    key: "free",
    name: "beUI",
    features: [
      "free.features.components",
      "free.features.registry",
      "free.features.license",
    ],
    href: "/components/motion",
  },
  {
    key: "pro",
    name: "beUI Pro",
    features: [
      "pro.features.blocks",
      "pro.features.templates",
      "pro.features.illustrations",
      "pro.features.agents",
      "pro.features.registry",
      "pro.features.projects",
      "pro.features.updates",
    ],
    href: "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=landing_comparison",
  },
] as const;

export function FreeAndPro() {
  const t = useTranslations("Landing.plans");
  const tHero = useTranslations("Landing.hero");
  return (
    <section
      aria-labelledby="landing-plans"
      className="mx-auto max-w-5xl px-4 pt-20 pb-8 sm:pt-28"
    >
      <div className="mb-10 text-center">
        <p className="text-sm text-muted-foreground">{t("eyebrow")}</p>
        <h2
          id="landing-plans"
          className="mt-4 text-balance font-display text-3xl font-medium tracking-tight md:text-4xl"
        >
          {t("title")}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {OPTIONS.map((option, index) => (
          <div
            key={option.name}
            className={cn(
              "relative flex h-full flex-col rounded-3xl border p-6 sm:p-8",
              index
                ? styles.proCard
                : "border-border bg-card/40",
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <h3
                className={cn("text-lg font-medium", index && "text-primary")}
              >
                {option.name}
              </h3>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {t(`${option.key}.badge`)}
              </span>
            </div>
            <p className="mt-7 text-xl font-medium tracking-tight">
              {t(`${option.key}.title`)}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {t(`${option.key}.description`)}
            </p>
            <ul className="my-7 space-y-3">
              {option.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-sm leading-6">
                  <Check
                    aria-hidden="true"
                    className={cn(
                      "mt-1 size-4 shrink-0",
                      index ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  {t(feature)}
                </li>
              ))}
            </ul>
            <PressLink
              href={option.href}
              className={`${index ? styles.primaryLink : styles.secondaryLink} mt-auto self-start`}
              {...(index
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {option.key === "free"
                ? t("free.cta")
                : tHero("explorePro")}
              {index ? (
                <ArrowUpRight aria-hidden="true" className="size-4" />
              ) : (
                <ArrowRight aria-hidden="true" className="size-4" />
              )}
            </PressLink>
          </div>
        ))}
      </div>
    </section>
  );
}
