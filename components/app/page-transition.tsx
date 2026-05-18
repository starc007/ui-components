"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      key={pathname}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
      onAnimationComplete={() => {
        // Strip transform so this wrapper stops creating a containing block
        // for descendant fixed-position elements (modals, sheets).
        const el = ref.current;
        if (!el) return;
        el.style.transform = "none";
        el.style.willChange = "auto";
      }}
    >
      {children}
    </motion.div>
  );
}
