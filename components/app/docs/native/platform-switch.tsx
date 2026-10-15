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

/** Switches every component page to a platform and remembers the choice. */
export function choosePlatform(value: string) {
  if (value !== "web" && value !== "native") return;
  const data = document.documentElement.dataset;
  if (value === "native") data.platform = "native";
  else delete data.platform;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
  const url = new URL(window.location.href);
  if (value === "native") url.searchParams.set(PARAM, value);
  else url.searchParams.delete(PARAM);
  window.history.replaceState(window.history.state, "", url);
  window.dispatchEvent(new Event(EVENT));
}

const trigger = "w-full justify-center gap-1.5";

/**
 * Picks whether component pages show the web or the React Native docs. The
 * `block` layout fills its container, for the sidebar.
 */
export function PlatformSwitch({
  layout = "inline",
  className,
}: {
  layout?: "inline" | "block";
  className?: string;
}) {
  const platform = usePlatform();
  const block = layout === "block";

  return (
    <Tabs value={platform} onValueChange={choosePlatform} variant="segment">
      <TabsList
        aria-label="Platform"
        className={cn(block && "grid w-full grid-cols-2", className)}
      >
        <TabsTrigger value="web" className={cn(block && trigger)}>
          <Globe aria-hidden="true" className="size-3.5 shrink-0" />
          Web
        </TabsTrigger>
        <TabsTrigger value="native" className={cn(block && trigger)}>
          <Smartphone aria-hidden="true" className="size-3.5 shrink-0" />
          React Native
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
