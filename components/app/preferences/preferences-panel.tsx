"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { Drawer } from "@/components/motion/drawer";
import { cn } from "@/lib/utils";
import { THEME_LIST, themeExportCss } from "@/lib/themes";
import {
  type IconSet,
  usePreferences,
} from "@/components/app/preferences/preferences-provider";

const ICON_SETS: { id: IconSet | string; name: string; soon?: boolean }[] = [
  { id: "lucide", name: "Lucide" },
  { id: "hugeicons", name: "Hugeicons", soon: true },
  { id: "phosphor", name: "Phosphor", soon: true },
];

export function PreferencesPanel() {
  const {
    colorTheme,
    setColorTheme,
    iconSet,
    setIconSet,
    panelOpen,
    setPanelOpen,
  } = usePreferences();
  const [copied, setCopied] = useState(false);

  const copyTheme = async () => {
    await navigator.clipboard.writeText(themeExportCss(colorTheme));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      open={panelOpen}
      onOpenChange={setPanelOpen}
      side="right"
      ariaLabel="Customize"
      className="gap-8 p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Customize</h2>
        <button
          type="button"
          onClick={() => setPanelOpen(false)}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <section>
        <p className="font-pixel text-xs font-medium uppercase text-muted-foreground">
          Theme
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {THEME_LIST.map((t) => {
            const active = colorTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setColorTheme(t.id)}
                aria-pressed={active}
                aria-label={t.name}
                title={t.name}
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow",
                  active && "ring-2 ring-foreground/40",
                )}
                style={{ background: t.swatch }}
              >
                {active ? <Check className="h-3 w-3 text-white" /> : null}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={copyTheme}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-card/70"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied CSS" : "Copy theme CSS"}
        </button>
      </section>

      <section>
        <p className="font-pixel text-xs font-medium uppercase text-muted-foreground">
          Icons
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {ICON_SETS.map((s) => {
            const active = iconSet === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={s.soon}
                onClick={() => !s.soon && setIconSet(s.id as IconSet)}
                aria-pressed={active}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors",
                  active
                    ? "border-foreground/30 bg-card text-foreground"
                    : "border-border text-foreground hover:bg-card",
                  s.soon && "cursor-not-allowed opacity-50",
                )}
              >
                <span>{s.name}</span>
                {s.soon ? (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Soon
                  </span>
                ) : active ? (
                  <Check className="h-4 w-4" />
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Preferences reset on refresh.
        </p>
      </section>
    </Drawer>
  );
}
