"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/app/docs/copy-button";
import { ActionSwapCascadeText } from "@/components/motion/action-swap-cascade";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { registry } from "@/lib/registry";
import { cn } from "@/lib/utils";

const PM_COMMANDS = {
  bun: "bunx --bun",
  npm: "npx",
  pnpm: "pnpm dlx",
  yarn: "yarn dlx",
} as const;

type PM = keyof typeof PM_COMMANDS;
const PMS = Object.keys(PM_COMMANDS) as PM[];

// The web components install through shadcn from the @beui registry. The
// native ones use beUI Native's own CLI, which runs on Node, so Bun runs it
// without --bun.
const TOOLS = {
  shadcn: { name: "shadcn", prefix: "@beui/", runners: PM_COMMANDS },
  "beui-native": {
    name: "beui-native",
    prefix: "",
    runners: { ...PM_COMMANDS, bun: "bunx" },
  },
} as const;
const CYCLE_MS = 1800;

const COMPONENT_SLUGS = registry.flatMap((cat) =>
  cat.components.flatMap((comp) =>
    comp.examples
      ? comp.examples.flatMap((example) =>
          example.installSlug ? [example.installSlug] : [],
        )
      : [comp.slug],
  ),
);

export function InstallCommand({
  className,
  slug,
  slugs = COMPONENT_SLUGS,
  tool = "shadcn",
}: {
  className?: string;
  slug?: string;
  /** Names to cycle through when no `slug` is given. */
  slugs?: readonly string[];
  tool?: keyof typeof TOOLS;
}) {
  const { name, prefix, runners } = TOOLS[tool];
  const [pm, setPm] = useState<PM>("bun");
  const [nameIndex, setNameIndex] = useState(0);

  useEffect(() => {
    if (slug) return;
    const id = setInterval(() => {
      setNameIndex((i) => (i + 1) % slugs.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [slug, slugs]);

  const currentSlug = slug ?? slugs[nameIndex % slugs.length];
  const runner = runners[pm].split(" ");
  const copyValue = `${runners[pm]} ${name} add ${prefix}${currentSlug}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card text-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Tabs
          value={pm}
          onValueChange={(v) => setPm(v as PM)}
          variant="segment"
        >
          <TabsList className="gap-0.5 rounded-none bg-transparent p-0">
            {PMS.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                indicatorClassName="bg-background border border-border shadow-none"
                className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground"
              >
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="ml-auto shrink-0">
          <CopyButton
            text={copyValue}
            eventName="copy_install_command"
            eventLabel={currentSlug}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max px-5 py-4 font-mono text-[13px] whitespace-nowrap">
          <span className="select-none text-[#6e7781] dark:text-[#8b949e]">{"$ "}</span>
          <span className="text-[#1f6feb] dark:text-[#ffa657]">
            {runner[0]}
          </span>
          {runner[1] && (
            <span className="text-[#6f42c1] dark:text-[#d2a8ff]">
              {" "}{runner[1]}
            </span>
          )}
          <span className="text-[#24292f] dark:text-[#e6edf3]">{` ${name} `}</span>
          <span className="text-[#0550ae] dark:text-[#79c0ff]">add</span>
          <span className="text-[#24292f]/70 dark:text-[#e6edf3]/60">{" "}{prefix}</span>
          <ActionSwapCascadeText
            value={currentSlug}
            className="font-medium text-[#0a3069] dark:text-[#a5d6ff]"
          >
            {currentSlug}
          </ActionSwapCascadeText>
        </div>
      </div>
    </div>
  );
}
