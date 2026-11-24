"use client";

import { Layers, LayoutTemplate, Shapes, Smartphone } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { useTranslations } from "use-intl";
import { ShaderBackground } from "@/components/motion/shader-background";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { ProCta } from "@/components/app/pro-cta";
import { LandingButton } from "./landing-button";

const SERVICES = [
  { id: "components", icon: Shapes },
  { id: "systems", icon: Layers },
  { id: "landing", icon: LayoutTemplate },
  { id: "native", icon: Smartphone },
] as const;

const CAL_URL = "https://cal.com/saurra3h/30min";
const EMAIL = "saurabh10102@gmail.com";

// The same mesh as beUI Pro's closing CTA, so both sites end alike.
const MESH = {
  light: ["#fde6d4", "#f6a27f", "#fcfcfc", "#9fcde3"],
  dark: ["#151515", "#7a2410", "#151515", "#0b3a4d"],
} as const;

/**
 * Closing work-with-me panel. A slow mesh gradient mounts once the panel is
 * near the viewport and fades in over 1s, then dissolves toward the centre so
 * the copy sits on a clean surface. It unmounts when scrolled far away.
 * Reduced motion: the gradient holds still.
 */
export function ContactStrip({ className }: { className?: string }) {
  const t = useTranslations("Landing.contact");
  const tHero = useTranslations("Landing.hero");
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "200px 0px" });
  const dark = useTheme().resolvedTheme === "dark";
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="landing-contact" className={cn("mx-auto max-w-6xl px-4", className)}>
      <div
        ref={ref}
        className="relative isolate overflow-clip rounded-3xl border border-border bg-background p-6 sm:p-10 lg:p-14"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {near ? (
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: dark ? 0.8 : 0.6 }}
              transition={{ duration: reduce ? 0 : 1, ease: EASE_OUT }}
            >
              <ShaderBackground
                key={dark ? "dark" : "light"}
                variant="mesh-gradient"
                colors={[...(dark ? MESH.dark : MESH.light)]}
                distortion={0.8}
                swirl={0.5}
                speed={0.2}
              />
            </motion.div>
          ) : null}
          <div className="absolute inset-0 bg-background/10 dark:bg-background/30" />
          {/* The copy sits on the left, so the wash clears that side and lets
              the gradient show on the right. */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_15%_50%,var(--background),transparent)] opacity-80 dark:opacity-90" />
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="max-w-lg">
            <p className="inline-flex items-center rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              {t("eyebrow")}
            </p>
            <h2
              id="landing-contact"
              className="mt-5 text-balance text-2xl font-medium leading-tight tracking-tight md:text-[2rem]"
            >
              <span className="text-foreground">{t("title")}</span>{" "}
              <span className="text-muted-foreground">{t("description")}</span>
            </h2>
            <div className="mt-7 flex flex-wrap gap-2">
              <ProCta href={CAL_URL} target="_blank" rel="noreferrer noopener" className="min-h-9 text-xs">
                {t("bookCall")}
                <span className="sr-only"> {tHero("opensInNewTab")}</span>
              </ProCta>
              <LandingButton
                href={`mailto:${EMAIL}`}
                variant="outline"
                className="h-9 bg-background/70 backdrop-blur-md"
              >
                {t("email")}
              </LandingButton>
            </div>
          </div>

          {/* A frosted list of the work, over the gradient side of the card. */}
          <div className="rounded-2xl border border-border bg-background/75 p-2 backdrop-blur-md">
            <p className="px-3 pt-2 pb-1 text-xs text-muted-foreground">{t("servicesLabel")}</p>
            <ul>
              {SERVICES.map(({ id, icon: Icon }) => (
                <li key={id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  {t(`services.${id}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
