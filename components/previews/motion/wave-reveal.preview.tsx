"use client";

import { Check, Crown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { WaveReveal, type WaveRevealType } from "@/components/motion/wave-reveal";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

const TYPES: { value: WaveRevealType; label: string }[] = [
  { value: "vertical", label: "Vertical" },
  { value: "center", label: "Center" },
  { value: "horizontal", label: "Horizontal" },
];

// Both screens share one layout, so each part changes in place as the wave
// passes over it: the crown turns into the check, the rows into the receipt.
function Screen({
  done,
  icon,
  eyebrow,
  rows,
  action,
  onAction,
}: {
  done?: boolean;
  icon: ReactNode;
  eyebrow: string;
  rows: [string, string][];
  action: string;
  onAction: () => void;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-full",
            done ? "bg-emerald-500 text-white" : "bg-foreground/10 text-foreground",
          )}
        >
          {icon}
        </span>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{eyebrow}</p>
          <p className="text-base font-medium">Pro plan</p>
        </div>
        <p className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">$12</span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </p>
      </div>

      <dl className="divide-y divide-border rounded-xl border border-border text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 px-3 py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>

      <motion.button
        type="button"
        onClick={onAction}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={SPRING_PRESS}
        className={cn(
          "h-10 rounded-full text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          done
            ? "border border-border hover:bg-foreground/5"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {action}
      </motion.button>
    </div>
  );
}

export function WaveRevealPreview() {
  const [type, setType] = useState<WaveRevealType>("vertical");
  const [upgraded, setUpgraded] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <WaveReveal
        type={type}
        revealed={upgraded}
        className="w-full max-w-[19rem] rounded-2xl border border-border"
        revealedContent={
          <Screen
            done
            icon={<Check className="size-5" strokeWidth={2.5} />}
            eyebrow="You're now on"
            rows={[
              ["Projects", "Unlimited"],
              ["Started", "Today"],
              ["Next bill", "Dec 25"],
            ]}
            action="Done"
            onAction={() => setUpgraded(false)}
          />
        }
      >
        <Screen
          icon={<Crown className="size-5" />}
          eyebrow="Upgrade to"
          rows={[
            ["Projects", "Unlimited"],
            ["Billing", "Monthly"],
            ["Card", "Visa ·· 4242"],
          ]}
          action="Upgrade"
          onAction={() => setUpgraded(true)}
        />
      </WaveReveal>

      <Tabs value={type} onValueChange={setType} variant="pill">
        <TabsList aria-label="Wave type" wrapperClassName="w-auto">
          {TYPES.map((item) => (
            <TabsTrigger key={item.value} value={item.value} className="text-xs">
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
