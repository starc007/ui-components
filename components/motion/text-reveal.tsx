"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export interface TextRevealProps {
  text: string;
  className?: string;
}

export function TextReveal({ text, className }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "start 20%"],
  });
  const words = text.split(" ");

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-2xl font-medium leading-snug text-(--color-fg)/20 md:text-4xl">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = (i + 1) / words.length;
          return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>;
        })}
      </p>
    </div>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <motion.span style={{ opacity }} className="text-(--color-fg)">
      {children}
    </motion.span>
  );
}
