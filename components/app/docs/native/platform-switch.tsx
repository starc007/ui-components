"use client";

import { Globe, Smartphone } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import {
  PLATFORM_EVENT as EVENT,
  PLATFORM_PARAM as PARAM,
  PLATFORM_STORAGE_KEY as STORAGE_KEY,
  type Platform,
} from "@/lib/platform";
import { cn } from "@/lib/utils";

// The platform lives on <html data-platform>, set before paint by
// PLATFORM_SCRIPT in the root layout. Every switch on the page reads it, so
// the sidebar's and the inline one stay in step.
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

const readPlatform = (): Platform =>
  document.documentElement.dataset.platform === "native" ? "native" : "web";

// Crawlers and the first hydration pass see the web docs.
const serverPlatform = (): Platform => "web";

export function usePlatform() {
  return useSyncExternalStore(subscribe, readPlatform, serverPlatform);
}

const subscribeNever = () => () => {};

/** False while hydrating server HTML, true for every render after. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/** Switches every component page to a platform and remembers the choice. */
export function choosePlatform(
  value: string,
  // Off when a link is about to navigate away: the current URL needn't change.
  { syncUrl = true }: { syncUrl?: boolean } = {},
) {
  if (value !== "web" && value !== "native") return;
  const data = document.documentElement.dataset;
  if (value === "native") data.platform = "native";
  else delete data.platform;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
  if (syncUrl) {
    const url = new URL(window.location.href);
    if (value === "native") url.searchParams.set(PARAM, value);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url);
  }
  window.dispatchEvent(new Event(EVENT));
}

const trigger = "w-full justify-center";

/**
 * Picks whether component pages show the web or the React Native docs. The
 * `block` layout fills its container, for the sidebar. Only the selected
 * platform carries its icon.
 */
export function PlatformSwitch({
  layout = "inline",
  className,
}: {
  layout?: "inline" | "block";
  className?: string;
}) {
  const platform = usePlatform();
  const hydrated = useHydrated();
  const block = layout === "block";
  return (
    // The server can't know the reader's platform, so its HTML picks Web.
    // Until hydration, a reader on React Native gets the switch hidden (its
    // space kept) instead of the wrong tab. After it, the switch remounts on
    // the right tab, so the pill lands there instead of gliding across.
    <Tabs
      key={hydrated ? "client" : "server"}
      className={cn(!hydrated && "[html[data-platform=native]_&]:invisible")}
      value={platform}
      onValueChange={choosePlatform}
      variant="pill"
      icons="selected"
    >
      <TabsList
        aria-label="Platform"
        className={cn(block && "grid w-full grid-cols-2", className)}
      >
        <TabsTrigger
          value="web"
          icon={<Globe className="size-3.5" />}
          className={cn(block && trigger)}
        >
          Web
        </TabsTrigger>
        <TabsTrigger
          value="native"
          icon={<Smartphone className="size-3.5" />}
          className={cn(block && trigger)}
        >
          React Native
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
