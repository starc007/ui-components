"use client";

import { Check, Copy } from "lucide-react";
import {
  ActionSwapCascadeButton,
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

export function ActionSwapCascadePreview() {
  return (
    <div className="flex w-full justify-center">
      <ActionSwapCascadeButton items={CTA_ITEMS} variant="primary" />
    </div>
  );
}
