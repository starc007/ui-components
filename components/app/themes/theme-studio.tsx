"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "use-intl";
import { CopyButton } from "@/components/motion/copy-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { Tooltip } from "@/components/motion/tooltip";
import { cn } from "@/lib/utils";
import { ThemeBoard } from "./theme-board";
import {
  COLOR_SWATCH,
  DEFAULT_THEME,
  parseTheme,
  previewCss,
  THEME_BASES,
  THEME_COLORS,
  type ThemeChoice,
  themeCss,
  themeQuery,
} from "./theme-builder";

const STYLE_ID = "beui-theme-preview";

/**
 * Pick a color and a base gray; the whole page wears the theme while you
 * choose, so menus, toasts and the header show it too. The choice lives in
 * the URL to share, and the CSS below is ready for globals.css.
 */
export function ThemeStudio() {
  const t = useTranslations("Pages.themes");
  const [choice, setChoice] = useState<ThemeChoice>(DEFAULT_THEME);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Read a shared link once. The prerendered page can't know it, so the
  // default renders first and the link's theme follows on mount.
  useEffect(() => {
    setChoice(parseTheme(new URLSearchParams(window.location.search)));
    setMounted(true);
  }, []);

  // Keep the URL shareable without a navigation.
  useEffect(() => {
    if (!mounted) return;
    const url = `${window.location.pathname}${themeQuery(choice)}`;
    window.history.replaceState(window.history.state, "", url);
  }, [choice, mounted]);

  // Theme the whole page, and hand it back on the way out.
  useEffect(() => {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.append(style);
    }
    style.textContent = previewCss(choice);
  }, [choice]);
  useEffect(() => () => document.getElementById(STYLE_ID)?.remove(), []);

  const css = useMemo(
    () =>
      themeCss(
        choice,
        t("exportTitle", { color: t(`colors.${choice.color}`), base: t(`bases.${choice.base}`) }),
      ),
    [choice, t],
  );
  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:pt-14 md:px-6">
      <header className="mx-auto max-w-xl text-center">
        <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("intro")}</p>
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--announcement-h)+4.5rem)]">
          <section className="flex flex-col gap-5 rounded-3xl bg-card p-4">
            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-medium text-foreground">{t("color")}</h2>
              <div className="flex flex-wrap gap-1.5">
                {THEME_COLORS.map((color) => {
                  const selected = choice.color === color;
                  return (
                    <Tooltip key={color} content={t(`colors.${color}`)} side="bottom">
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={t(`colors.${color}`)}
                        onClick={() => setChoice((current) => ({ ...current, color }))}
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full outline-none transition-shadow duration-150",
                          "focus-visible:ring-2 focus-visible:ring-ring",
                          selected ? "ring-2 ring-foreground ring-offset-2 ring-offset-card" : "hover:ring-2 hover:ring-border-strong",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="size-6 rounded-full border border-border"
                          style={{ background: COLOR_SWATCH[color] }}
                        />
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-medium text-foreground">{t("base")}</h2>
              <Tabs
                value={choice.base}
                onValueChange={(base) =>
                  setChoice((current) => ({ ...current, base: base as ThemeChoice["base"] }))
                }
                variant="pill"
              >
                <TabsList aria-label={t("base")}>
                  {THEME_BASES.map((base) => (
                    <TabsTrigger key={base} value={base}>
                      {t(`bases.${base}`)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2.5">
              <h2 className="text-sm font-medium text-foreground">{t("mode")}</h2>
              <Tabs value={mode} onValueChange={setTheme} variant="pill">
                <TabsList aria-label={t("mode")}>
                  <TabsTrigger value="light">{t("modes.light")}</TabsTrigger>
                  <TabsTrigger value="dark">{t("modes.dark")}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <CopyButton
                showLabel
                value={() => window.location.href}
                labels={{ copy: t("copyLink"), copied: t("linkCopied") }}
              />
              <button
                type="button"
                onClick={() => setChoice(DEFAULT_THEME)}
                disabled={choice.color === DEFAULT_THEME.color && choice.base === DEFAULT_THEME.base}
                className="inline-flex h-8 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                {t("reset")}
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-card">
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2">
              <h2 className="text-sm font-medium text-foreground">{t("css")}</h2>
              <CopyButton showLabel value={css} labels={{ copy: t("copyCss"), copied: t("cssCopied") }} />
            </div>
            <pre className="m-2 mt-0 max-h-72 overflow-auto rounded-2xl bg-background p-3 font-mono text-[11px] leading-5 text-muted-foreground">
              {css}
            </pre>
            <p className="px-4 pb-3.5 text-xs text-muted-foreground">{t("cssHint")}</p>
          </section>
        </aside>

        <ThemeBoard />
      </div>
    </div>
  );
}
