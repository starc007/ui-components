"use client";

import { ArrowUpRight, Mail, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PressLink } from "@/components/app/press-link";
import { EASE_IN_OUT } from "@/lib/ease";

const CAL_URL = "https://cal.com/saurra3h/30min";
const EMAIL = "saurabh10102@gmail.com";

export function WorkCta() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[28px] border border-border px-8 py-16 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_-30px_44px_-32px_rgba(0,0,0,0.12)] md:px-16 md:py-20">
          <div className="relative grid items-center gap-12 md:grid-cols-2">
            {/* left: copy + actions */}
            <div className="flex flex-col items-start text-left">
              <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                Contact us
              </span>

              <h2 className="mt-6 font-pixel text-3xl font-semibold text-foreground md:text-5xl md:leading-[1.15]">
                Want components built for your product?
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
                Custom motion components and frontend systems, built to spec.
                Book a call or drop a line, whichever's easier.
              </p>

              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <PressLink
                  href={CAL_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Book a call
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </PressLink>

                <PressLink
                  href={`mailto:${EMAIL}`}
                  className="group inline-flex items-center justify-center gap-2 rounded-full border border-border bg-transparent px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Mail className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Email me
                </PressLink>
              </div>
            </div>

            {/* right: floating component-preview stack */}
            <CtaVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaVisual() {
  const reduce = useReducedMotion();

  const float = (range: number, duration: number) =>
    reduce
      ? undefined
      : {
          y: [-range, range, -range],
          transition: { duration, ease: EASE_IN_OUT, repeat: Infinity },
        };

  return (
    <div aria-hidden className="relative hidden h-72 select-none md:block">
      {/* back: switch row */}
      <motion.div
        animate={float(6, 6)}
        className="absolute right-6 top-2 w-56 rotate-[6deg] rounded-2xl border border-border bg-background p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-2 w-20 rounded-full bg-foreground/15" />
            <div className="h-2 w-12 rounded-full bg-foreground/10" />
          </div>
          <div className="flex h-6 w-10 items-center rounded-full bg-foreground/15 p-0.5">
            <div className="ml-auto h-5 w-5 rounded-full bg-foreground" />
          </div>
        </div>
      </motion.div>

      {/* mid: stat / number card */}
      <motion.div
        animate={float(8, 7)}
        className="absolute left-2 top-16 w-52 -rotate-3 rounded-2xl border border-border bg-background p-4 shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full bg-foreground/10" />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            +24%
          </span>
        </div>
        <div className="mt-3 font-pixel text-2xl font-semibold text-foreground">
          48,210
        </div>
        <div className="mt-3 flex items-end gap-1">
          {[5, 8, 6, 10, 7, 12, 9].map((h, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars
              key={i}
              style={{ height: h * 4 }}
              className="w-2 rounded-sm bg-foreground/15"
            />
          ))}
        </div>
      </motion.div>

      {/* front: button pill card */}
      <motion.div
        animate={float(7, 5.5)}
        className="absolute right-2 bottom-2 w-48 rotate-2 rounded-2xl border border-border bg-background p-4 shadow-lg"
      >
        <div className="h-2 w-24 rounded-full bg-foreground/10" />
        <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
          Get started
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </motion.div>
    </div>
  );
}
