"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SpotlightCardProps {
  children: ReactNode;
  size?: number;
  color?: string;
  className?: string;
  /** Show a soft ring at the cursor border. */
  border?: boolean;
}

export function SpotlightCard({
  children,
  size = 380,
  color = "var(--color-accent)",
  border = true,
  className,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left);
    y.set(e.clientY - rect.top);
  };

  const onMouseLeave = () => {
    x.set(-9999);
    y.set(-9999);
  };

  const bg = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, color-mix(in oklch, ${color} 18%, transparent), transparent 60%)`;
  const ringBg = useMotionTemplate`radial-gradient(${size * 0.6}px circle at ${x}px ${y}px, color-mix(in oklch, ${color} 40%, transparent), transparent 50%)`;

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev)",
        className,
      )}
    >
      {border ? (
        <motion.div
          aria-hidden
          style={{ background: ringBg }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 [mask-image:linear-gradient(black,black)] [mask-clip:padding-box,border-box] [mask-composite:exclude] p-px"
        />
      ) : null}
      <motion.div
        aria-hidden
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
