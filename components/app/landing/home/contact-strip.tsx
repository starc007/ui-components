"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { ShaderBackground } from "@/components/motion/shader-background";
import { cn } from "@/lib/utils";
import { LandingButton } from "./landing-button";

const CAL_URL = "https://cal.com/saurra3h/30min";
const EMAIL = "saurabh10102@gmail.com";

// Deep navy base with the brand blue, the hero's powder blue and its peach.
const SHADER_COLORS = ["#0b1d33", "#0285f7", "#7ec0de", "#f4b27c"];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='.55'/%3E%3C/svg%3E\")";

/**
 * Closing work-with-me panel on a slow mesh-gradient shader. The canvas
 * mounts once the panel nears the viewport; until then the navy base color
 * holds its place, so nothing flashes or shifts. A left scrim keeps the copy
 * readable wherever the gradient drifts.
 */
export function ContactStrip({ className }: { className?: string }) {
  const t = useTranslations("Landing.contact");
  const tHero = useTranslations("Landing.hero");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "300px 0px" });

  return (
    <section aria-labelledby="landing-contact" className={cn("mx-auto max-w-6xl px-4", className)}>
      <div
        ref={ref}
        className="relative isolate overflow-hidden rounded-2xl bg-[#0b1d33] px-6 py-12 sm:px-10 sm:py-16"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          {inView ? (
            <ShaderBackground
              variant="mesh-gradient"
              colors={SHADER_COLORS}
              distortion={0.85}
              swirl={0.45}
              speed={0.22}
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_20_36/0.72)_0%,rgb(8_20_36/0.35)_55%,transparent_100%)]" />
          <div
            className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
        </div>

        <div className="max-w-md">
          <span className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
            <Mail aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-white/70">
            {t("eyebrow")}
          </p>
          <h2
            id="landing-contact"
            className="mt-2 text-balance text-2xl font-medium leading-tight tracking-tight text-white md:text-[2rem]"
          >
            {t("title")}
          </h2>
          <p className="mt-3 max-w-sm text-pretty text-[13px] leading-5 text-white/75">
            {t("description")}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <LandingButton href={CAL_URL} target="_blank" rel="noreferrer noopener" variant="inverse">
              {t("bookCall")}
              <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> {tHero("opensInNewTab")}</span>
            </LandingButton>
            <LandingButton href={`mailto:${EMAIL}`} variant="glass">
              {t("email")}
            </LandingButton>
          </div>
        </div>
      </div>
    </section>
  );
}
