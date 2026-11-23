"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { useTranslations } from "use-intl";
import { ShaderBackground } from "@/components/motion/shader-background";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";

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
        className="relative isolate overflow-clip rounded-3xl border border-border bg-background px-6 py-16 text-center sm:px-12 sm:py-24"
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
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_50%,var(--background),transparent)] opacity-70 dark:opacity-80" />
        </div>

        <div className="mx-auto flex max-w-md flex-col items-center">
          <span className="grid size-9 place-items-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur">
            <Mail aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-6 text-sm text-muted-foreground">{t("eyebrow")}</p>
          <h2
            id="landing-contact"
            className="mt-2 text-balance text-2xl font-medium leading-tight tracking-tight text-foreground md:text-[2rem]"
          >
            {t("title")}
          </h2>
          <p className="mt-3 max-w-sm text-pretty text-sm leading-5 text-muted-foreground">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <LandingButton href={CAL_URL} target="_blank" rel="noreferrer noopener">
              {t("bookCall")}
              <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> {tHero("opensInNewTab")}</span>
            </LandingButton>
            <LandingButton
              href={`mailto:${EMAIL}`}
              variant="outline"
              className="bg-background/70 backdrop-blur-md"
            >
              {t("email")}
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
