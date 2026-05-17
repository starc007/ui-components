"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SplitMode = "word" | "char";

export interface TextRevealProps {
  text: string | string[];
  as?: ElementType;
  className?: string;
  split?: SplitMode;
  stagger?: number;
  delay?: number;
  blur?: number;
  yOffset?: string | number;
  spring?: { stiffness?: number; damping?: number; mass?: number };
  once?: boolean;
  whileInView?: boolean;
  children?: ReactNode;
}

const DEFAULT_SPRING = { stiffness: 140, damping: 26, mass: 1.2 };

export function TextReveal({
  text,
  as: Comp = "span",
  className,
  split = "word",
  stagger = 0.09,
  delay = 0,
  blur = 12,
  yOffset = "40%",
  spring,
  once = true,
  whileInView = false,
  children,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  const shouldAnimate = whileInView ? inView : true;

  const lines = Array.isArray(text) ? text : [text];
  const s = { ...DEFAULT_SPRING, ...spring };

  let unitIndex = 0;

  return (
    <Comp ref={ref} className={cn("block", className)}>
      {lines.map((line, li) => {
        const units = split === "word" ? line.split(" ") : Array.from(line);
        return (
          <span key={`${line}-${li}`} className="block">
            {units.map((unit, i) => {
              const d = delay + unitIndex * stagger;
              unitIndex += 1;
              return (
                <motion.span
                  key={`${unit}-${i}`}
                  initial={{ y: yOffset, opacity: 0, filter: `blur(${blur}px)` }}
                  animate={
                    shouldAnimate
                      ? { y: 0, opacity: 1, filter: "blur(0px)" }
                      : { y: yOffset, opacity: 0, filter: `blur(${blur}px)` }
                  }
                  transition={{
                    y: { type: "spring", ...s, delay: d },
                    opacity: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: d },
                    filter: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: d },
                  }}
                  className="inline-block will-change-transform"
                >
                  {unit}
                  {split === "word" && i < units.length - 1 ? (
                    <span className="inline-block">&nbsp;</span>
                  ) : null}
                </motion.span>
              );
            })}
          </span>
        );
      })}
      {children}
    </Comp>
  );
}
