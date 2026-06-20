"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/app/copy-button";
import { ActionSwapCascadeText } from "@/components/motion/action-swap-cascade";
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

const REGISTRY_URL = "https://beui.dev/r";
const CYCLE_MS = 1800;

const COMPONENT_SLUGS = registry.flatMap((cat) =>
  cat.components.flatMap((comp) =>
    comp.examples
      ? comp.examples.filter((e) => e.installSlug).map((e) => e.installSlug!)
      : [comp.slug],
  ),
);

export function InstallCommand({ className }: { className?: string }) {
  const [pm, setPm] = useState<PM>("bun");
  const [nameIndex, setNameIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setNameIndex((i) => (i + 1) % COMPONENT_SLUGS.length);
    }, CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  const currentSlug = COMPONENT_SLUGS[nameIndex];
  const copyValue = `${PM_COMMANDS[pm]} shadcn add ${REGISTRY_URL}/${currentSlug}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-elev) text-sm",
        className,
      )}
    >
      <div className="flex items-center border-b border-(--color-border) px-3 py-1.5">
        <div className="flex gap-0.5">
          {PMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPm(p)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-medium transition-colors",
                pm === p
                  ? "border border-(--color-border) bg-(--color-bg) text-(--color-fg)"
                  : "text-(--color-fg-muted) hover:text-(--color-fg)",
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <CopyButton text={copyValue} />
        </div>
      </div>

      <pre className="px-5 py-4 font-mono text-[13px]">
        <code className="text-(--color-fg-muted)">
          <span className="select-none">{"$ "}</span>
          {PM_COMMANDS[pm]}
          {" shadcn add "}
          {REGISTRY_URL}/
          <ActionSwapCascadeText
            value={currentSlug}
            className="font-semibold text-(--color-fg)"
          >
            {currentSlug}
          </ActionSwapCascadeText>
        </code>
      </pre>
    </div>
  );
}
