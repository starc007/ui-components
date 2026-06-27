"use client";

import { Moon, Send, Sparkles, Sun } from "lucide-react";
import { useState } from "react";
import {
  type ActionSwapItem,
  ActionSwapRollButton,
} from "@/components/motion/action-swap-roll";

const TEXT_ITEMS: ActionSwapItem[] = [
  { id: "idle", label: "Save" },
  { id: "done", label: "Saved" },
];

const ICON_ITEMS: ActionSwapItem[] = [
  {
    id: "light",
    label: "Light",
    icon: <Sun className="h-4 w-4" />,
    ariaLabel: "Use light theme",
  },
  {
    id: "dark",
    label: "Dark",
    icon: <Moon className="h-4 w-4" />,
    ariaLabel: "Use dark theme",
  },
];

const CTA_ITEMS: ActionSwapItem[] = [
  {
    id: "send",
    label: "Send invite",
    icon: <Send className="h-4 w-4" />,
    ariaLabel: "Send invite",
  },
  {
    id: "sent",
    label: "Invite sent",
    icon: <Sparkles className="h-4 w-4" />,
    ariaLabel: "Invite sent",
  },
];

export function ActionSwapRollPreview() {
  const [textValue, setTextValue] = useState(TEXT_ITEMS[0]?.id);
  const [iconValue, setIconValue] = useState(ICON_ITEMS[0]?.id);
  const [ctaValue, setCtaValue] = useState(CTA_ITEMS[0]?.id);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ActionSwapRollButton
        items={TEXT_ITEMS}
        value={textValue}
        onValueChange={setTextValue}
        variant="secondary"
      />
      <ActionSwapRollButton
        items={ICON_ITEMS}
        value={iconValue}
        onValueChange={setIconValue}
        variant="outline"
        size="icon"
        iconOnly
      />
      <ActionSwapRollButton
        items={CTA_ITEMS}
        value={ctaValue}
        onValueChange={setCtaValue}
        variant="primary"
      />
    </div>
  );
}
