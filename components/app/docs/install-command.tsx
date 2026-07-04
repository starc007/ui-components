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

const REGISTRY_NAMESPACE = "@beui";
const CYCLE_MS = 1800;

const COMPONENT_SLUGS = registry.flatMap((cat) =>
  cat.components.flatMap((comp) =>
    comp.examples
      ? comp.examples.filter((e) => e.installSlug).map((e) => e.installSlug!)
      : [comp.slug],
  ),
);

export function InstallCommand({
  className,
  slug,
}: {
  className?: string;
  slug?: string;
}) {
  const [pm, setPm] = useState<PM>("bun");
  const [nameIndex, setNameIndex] = useState(0);

  useEffect(() => {
    if (slug) return;
    const id = setInterval(() => {
      setNameIndex((i) => (i + 1) % COMPONENT_SLUGS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, [slug]);

  const currentSlug = slug ?? COMPONENT_SLUGS[nameIndex];
  const copyValue = `${PM_COMMANDS[pm]} shadcn add ${REGISTRY_NAMESPACE}/${currentSlug}`;

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
                className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground aria-[selected=true]:text-foreground"
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
            {PM_COMMANDS[pm].split(" ")[0]}
          </span>
          {PM_COMMANDS[pm].split(" ")[1] && (
            <span className="text-[#6f42c1] dark:text-[#d2a8ff]">
              {" "}{PM_COMMANDS[pm].split(" ")[1]}
            </span>
          )}
          <span className="text-[#24292f] dark:text-[#e6edf3]">{" shadcn "}</span>
          <span className="text-[#0550ae] dark:text-[#79c0ff]">add</span>
          <span className="text-[#24292f]/70 dark:text-[#e6edf3]/60">{" "}{REGISTRY_NAMESPACE}/</span>
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
