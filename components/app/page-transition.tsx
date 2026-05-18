"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef, type ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      key={pathname}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onAnimationComplete={() => {
        // Strip transform + filter so this wrapper stops creating a containing
        // block for descendant `position: fixed` elements (modals, sheets).
        const el = ref.current;
        if (!el) return;
        el.style.transform = "none";
        el.style.filter = "none";
        el.style.willChange = "auto";
      }}
    >
      {children}
    </motion.div>
  );
}
