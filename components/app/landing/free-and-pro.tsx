import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { PressLink } from "@/components/app/press-link";
import { cn } from "@/lib/utils";
import styles from "./landing.module.css";

const OPTIONS = [
  {
    name: "beUI",
    eyebrow: "Free & open source",
    title: "Build with the essentials.",
    description:
      "Animated components you can install, customize, and keep in your codebase.",
    features: [
      "Components, blocks, charts, and AI interfaces",
      "Public shadcn registry and copy-paste source",
      "MIT licensed for personal and commercial projects",
    ],
    href: "/components/motion",
    label: "Browse free components",
  },
  {
    name: "beUI Pro",
    eyebrow: "Go further with Pro",
    title: "Start with more built for you.",
    description:
      "220+ premium blocks to build your next product faster. Get the complete collection with Lifetime, including full templates and animated illustrations.",
    features: [
      "220+ premium blocks and animated components",
      "Full landing-page templates · Lifetime",
      "Animated illustrations · Lifetime",
      "Agent Skill, MCP access, and one-command installs",
      "Private registry and downloadable source",
      "Unlimited personal and client projects",
      "All future updates · Lifetime",
    ],
    href: "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=landing_comparison",
    label: "Explore Pro",
  },
];

export function FreeAndPro() {
  return (
    <section
      aria-labelledby="landing-plans"
      className="mx-auto max-w-5xl px-4 pt-20 pb-8 sm:pt-28"
    >
      <div className="mb-10 text-center">
        <p className="text-sm text-muted-foreground">Free and Pro</p>
        <h2
          id="landing-plans"
          className="mt-4 text-balance font-display text-3xl font-medium tracking-tight md:text-4xl"
        >
          Choose your starting point
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
                {option.eyebrow}
              </span>
            </div>
            <p className="mt-7 text-xl font-medium tracking-tight">
              {option.title}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {option.description}
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
                  {feature}
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
              {option.label}
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
