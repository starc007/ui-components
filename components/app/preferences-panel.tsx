"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import { EASE_DRAWER } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  type ColorTheme,
  type IconSet,
  usePreferences,
} from "@/components/app/preferences-provider";

const COLOR_THEMES: { id: ColorTheme; name: string; swatch: string }[] = [
  { id: "default", name: "Mono", swatch: "oklch(40% 0 0)" },
  { id: "violet", name: "Violet", swatch: "oklch(55% 0.2 290)" },
  { id: "blue", name: "Blue", swatch: "oklch(55% 0.18 255)" },
  { id: "green", name: "Green", swatch: "oklch(56% 0.14 150)" },
  { id: "amber", name: "Amber", swatch: "oklch(74% 0.15 70)" },
];

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
    panelOpen: open,
    setPanelOpen: setOpen,
  } = usePreferences();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />
            <motion.aside
              role="dialog"
              aria-label="Customize"
              initial={reduce ? { opacity: 0 } : { x: "100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.32, ease: EASE_DRAWER }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col gap-8 border-l border-border bg-background p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Customize
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                <div className="mt-3 flex items-center gap-2.5">
                  {COLOR_THEMES.map((t) => {
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
                        {active ? (
                          <Check className="h-3 w-3 text-white" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
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
            </motion.aside>
          </>
      ) : null}
    </AnimatePresence>
  );
}
