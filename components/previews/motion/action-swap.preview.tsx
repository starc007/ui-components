"use client";

import { Check, Copy, Send, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ActionSwapButton, type ActionSwapItem } from "@/components/motion/action-swap";
import { EASE_OUT } from "@/lib/ease";

const BLUR_ITEMS: ActionSwapItem[] = [
  {
    id: "copy",
    label: "Copy link",
    icon: <Copy className="h-4 w-4" />,
    ariaLabel: "Copy link",
  },
  {
    id: "copied",
    label: "Copied",
    icon: <Check className="h-4 w-4" />,
    ariaLabel: "Copied",
  },
];

const ROLL_ITEMS: ActionSwapItem[] = [
  {
    id: "send",
    label: "Send",
    icon: <Send className="h-4 w-4" />,
    ariaLabel: "Send",
  },
  {
    id: "sent",
    label: "Sent",
    icon: <Sparkles className="h-4 w-4" />,
    ariaLabel: "Sent",
  },
];

export function ActionSwapPreview() {
  const [blurValue, setBlurValue] = useState(BLUR_ITEMS[0]?.id);
  const [rollValue, setRollValue] = useState(ROLL_ITEMS[0]?.id);
  const [variant, setVariant] = useState<"blur" | "roll">("blur");

  useEffect(() => {
    const id = window.setInterval(() => {
      setVariant((currentVariant) => currentVariant === "blur" ? "roll" : "blur");
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-12 min-w-36 items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0, filter: "blur(6px)", transform: "translateY(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)", transform: "translateY(-4px)" }}
          transition={{ duration: 0.22, ease: EASE_OUT }}
        >
          {variant === "blur" ? (
            <ActionSwapButton
              items={BLUR_ITEMS}
              value={blurValue}
              onValueChange={setBlurValue}
              animation="blur"
              variant="secondary"
            />
          ) : (
            <ActionSwapButton
              items={ROLL_ITEMS}
              value={rollValue}
              onValueChange={setRollValue}
              animation="roll"
              variant="primary"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
