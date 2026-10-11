"use client";

import { Bold, Italic, Link2, Strikethrough, Underline } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";

const actions = [
  { id: "bold", label: "Bold", shortcut: "⌘B", keys: "Meta+B", icon: Bold },
  { id: "italic", label: "Italic", shortcut: "⌘I", keys: "Meta+I", icon: Italic },
  { id: "underline", label: "Underline", shortcut: "⌘U", keys: "Meta+U", icon: Underline },
  { id: "strike", label: "Strikethrough", shortcut: "⌘⇧X", keys: "Meta+Shift+X", icon: Strikethrough },
] as const;

export function TooltipToolbarPreview() {
  const [active, setActive] = useState<string[]>(["bold"]);
  const toggle = (id: string) =>
    setActive((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <TooltipProvider delay={300} skipDelay={400}>
      <div className="flex w-full flex-col items-center gap-8 py-6">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          {actions.map(({ id, label, shortcut, keys, icon: Icon }) => (
            <Tooltip key={id} asLabel>
              <TooltipTrigger
                aria-pressed={active.includes(id)}
                aria-keyshortcuts={keys}
                onClick={() => toggle(id)}
                className={cn(
                  "grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
                  active.includes(id) && "bg-muted text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" arrow>
                <span className="flex items-center gap-2">
                  {label}
                  {/* The shortcut is announced through aria-keyshortcuts, not as part of the name. */}
                  <span aria-hidden="true" className="text-[10px] text-muted-foreground">
                    {shortcut}
                  </span>
                </span>
              </TooltipContent>
            </Tooltip>
          ))}
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
          <Tooltip asLabel disabled={active.length === 0}>
            <TooltipTrigger
              disabled={active.length === 0}
              className="grid size-8 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Link2 aria-hidden="true" className="size-4" />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="end" arrow>
              Insert link
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="max-w-xs text-center text-xs text-muted-foreground">
          The first label waits, the next ones open instantly. Click hides it until the pointer leaves.
        </p>
      </div>
    </TooltipProvider>
  );
}
