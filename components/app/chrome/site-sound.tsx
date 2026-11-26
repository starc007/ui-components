"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SoundProvider } from "@/lib/sound";

const STORAGE_KEY = "beui-sound";

type SiteSound = { enabled: boolean; setEnabled: (enabled: boolean) => void };

const SiteSoundContext = createContext<SiteSound>({ enabled: true, setEnabled: () => undefined });

/**
 * The site's sound setting: on by default, remembered across visits, and fed
 * to beUI's SoundProvider so the header toggle mutes every preview at once.
 */
export function SiteSoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  // Read after mount: the server render can't know the visitor's choice.
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "off") setEnabledState(false);
    } catch {
      // Storage can be blocked; sound stays on.
    }
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Storage can be blocked; the choice lasts for this visit.
    }
  }, []);

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);
  return (
    <SiteSoundContext.Provider value={value}>
      <SoundProvider enabled={enabled}>{children}</SoundProvider>
    </SiteSoundContext.Provider>
  );
}

export function useSiteSound() {
  return useContext(SiteSoundContext);
}
