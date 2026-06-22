"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type ColorTheme, themesStylesheet } from "@/lib/themes";

export type { ColorTheme };
// Future: "hugeicons" | "phosphor" | "tabler"
export type IconSet = "lucide";

type Preferences = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  iconSet: IconSet;
  setIconSet: (set: IconSet) => void;
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
};

const PreferencesCtx = createContext<Preferences | null>(null);

export function usePreferences() {
  const ctx = useContext(PreferencesCtx);
  if (!ctx)
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  return ctx;
}

/**
 * Site-only customization state (color theme, icon set). Intentionally NOT
 * persisted — resets to defaults on refresh.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");
  const [iconSet, setIconSet] = useState<IconSet>("lucide");
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    if (colorTheme === "default") delete el.dataset.theme;
    else el.dataset.theme = colorTheme;
  }, [colorTheme]);

  return (
    <PreferencesCtx.Provider
      value={{
        colorTheme,
        setColorTheme,
        iconSet,
        setIconSet,
        panelOpen,
        setPanelOpen,
      }}
    >
      {/* Full per-theme token sets, applied via data-theme on <html>. */}
      <style dangerouslySetInnerHTML={{ __html: themesStylesheet() }} />
      {children}
    </PreferencesCtx.Provider>
  );
}
