"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";
import { TextReveal } from "@/components/motion/text-reveal";
import { TextShimmer } from "@/components/motion/text-shimmer";
import { EASE_OUT } from "@/lib/ease";

const variants = ["chromatic", "reveal", "shimmer"] as const;

export function TextAnimationPreview() {
  const [variant, setVariant] =
    useState<(typeof variants)[number]>("chromatic");

  useEffect(() => {
    const id = window.setInterval(() => {
      setVariant((currentVariant) => {
        const index = variants.indexOf(currentVariant);
        return variants[(index + 1) % variants.length];
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="@container relative flex min-h-20 w-full items-center justify-center text-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0, filter: "blur(6px)", transform: "translateY(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)", transform: "translateY(-4px)" }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          {variant === "reveal" ? (
            <TextReveal
              as="h2"
              text="Motion in words."
              stagger={0.045}
              blur={6}
              yOffset="18%"
              className="text-balance text-3xl font-semibold tracking-tight text-foreground"
            />
          ) : variant === "chromatic" ? (
            // This sentence never wraps, so it scales with the column it sits
            // in rather than overflowing it at narrow widths.
            <ChromaticTextReveal
              prefix="Motion that feels"
              words={["natural.", "intentional.", "alive."]}
              startOnView={false}
              className="font-semibold tracking-tight [font-size:clamp(1.125rem,7.8cqw,1.875rem)]"
            />
          ) : (
            <TextShimmer duration={1.8} className="text-xl font-semibold">
              Loading with shimmer
            </TextShimmer>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
