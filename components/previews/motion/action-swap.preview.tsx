"use client";

import { Check, Copy, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { ActionSwapButton, type ActionSwapItem } from "@/components/motion/action-swap";

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

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ActionSwapButton
        items={BLUR_ITEMS}
        value={blurValue}
        onValueChange={setBlurValue}
        animation="blur"
        variant="secondary"
      />
      <ActionSwapButton
        items={ROLL_ITEMS}
        value={rollValue}
        onValueChange={setRollValue}
        animation="roll"
        variant="primary"
      />
    </div>
  );
}
