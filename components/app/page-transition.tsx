"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Skip enter animation on first load so LCP element is visible immediately.
  // After mount, navigations animate normally.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <motion.div
      ref={ref}
      key={pathname}
      initial={mounted ? (reduce ? { opacity: 0 } : { opacity: 0, y: 24 }) : false}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE_OUT }}
      onAnimationComplete={() => {
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
