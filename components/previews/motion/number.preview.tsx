"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion/animated-number";
import { NumberTicker } from "@/components/motion/number-ticker";
import { EASE_OUT } from "@/lib/ease";

export function NumberPreview() {
  const [value, setValue] = useState(48273);
  const [variant, setVariant] = useState<"ticker" | "animated">("ticker");

  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((currentValue) => currentValue + Math.floor(Math.random() * 50));
    }, 2500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVariant((currentVariant) => currentVariant === "ticker" ? "animated" : "ticker");
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-20 min-w-40 items-center justify-center text-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0, filter: "blur(6px)", transform: "translateY(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)", transform: "translateY(-4px)" }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          {variant === "ticker" ? (
            <div>
              <p className="text-xs text-muted-foreground">Active users</p>
              <NumberTicker
                value={value}
                className="text-3xl font-semibold tracking-tight text-foreground tabular-nums"
                format={(number) => number.toLocaleString()}
              />
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <div className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                <AnimatedNumber
                  value={129480}
                  format={(number) => `$${Math.round(number).toLocaleString()}`}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
