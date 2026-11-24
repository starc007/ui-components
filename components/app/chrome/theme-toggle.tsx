"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "use-intl";
import { useTheme } from "next-themes";
import { type ComponentProps, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

/**
 * The menu's trigger. The tooltip hands its ref and aria props to this
 * component, which passes them to the button the menu trigger clones, so one
 * button anchors both.
 */
function TriggerButton({
  theme,
  label,
  ...props
}: ComponentProps<"button"> & { theme: string | undefined; label: string }) {
  const Icon = THEMES.find((item) => item.value === theme)?.icon ?? Monitor;
  return (
    <DropdownMenuTrigger>
      <button
        type="button"
        aria-label={label}
        {...props}
        className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </DropdownMenuTrigger>
  );
}

/** One icon button that opens a Light, Dark and System menu. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Chrome.theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // The stored theme is unknown until mount; System stands in so the server
  // and first client render match.
  const current = mounted ? (theme ?? "system") : "system";

  return (
    <div className={cn("inline-flex", className)}>
      <DropdownMenu>
        <Tooltip content={t("label")} side="bottom">
          <TriggerButton theme={current} label={t("label")} />
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-36">
          <DropdownMenuRadioGroup value={current} onValueChange={setTheme}>
            {THEMES.map(({ value, label, icon: Icon }) => (
              <DropdownMenuRadioItem key={value} value={value} closeOnSelect>
                <Icon aria-hidden="true" />
                {t(label)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
