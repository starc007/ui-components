"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import {
  ActionSwapCascadeButton,
  ActionSwapCascadeText,
  type ActionSwapItem,
} from "@/components/motion/action-swap-cascade";

const CTA_ITEMS: ActionSwapItem[] = [
  {
    id: "copy",
    label: "Copy link",
    icon: <Copy className="h-4 w-4" />,
    ariaLabel: "Copy link",
  },
  {
    id: "copied",
    label: "Copied!",
    icon: <Check className="h-4 w-4" />,
    ariaLabel: "Copied",
  },
];

const LABELS = ["Install skills", "Open settings", "Ship updates"];

export function ActionSwapCascadePreview() {
  const [label, setLabel] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLabel((l) => (l + 1) % LABELS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <ActionSwapCascadeButton items={CTA_ITEMS} variant="primary" />

      <p className="text-lg font-medium text-foreground">
        <ActionSwapCascadeText value={LABELS[label] ?? LABELS[0]}>
          {LABELS[label] ?? LABELS[0]}
        </ActionSwapCascadeText>
      </p>
    </div>
  );
}
