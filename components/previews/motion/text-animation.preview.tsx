"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TextReveal } from "@/components/motion/text-reveal";
import { TextShimmer } from "@/components/motion/text-shimmer";
import { EASE_OUT } from "@/lib/ease";

export function TextAnimationPreview() {
  const [variant, setVariant] = useState<"reveal" | "shimmer">("reveal");

  useEffect(() => {
    const id = window.setInterval(() => {
      setVariant((currentVariant) => currentVariant === "reveal" ? "shimmer" : "reveal");
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-20 w-full items-center justify-center text-center">
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
