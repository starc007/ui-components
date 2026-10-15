"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import {
  PLATFORM_EVENT as EVENT,
  PLATFORM_PARAM as PARAM,
  PLATFORM_STORAGE_KEY as STORAGE_KEY,
  type Platform,
} from "@/lib/platform";

// The platform lives on <html data-platform>, set before paint by
// PLATFORM_SCRIPT in the root layout.
function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

const readPlatform = (): Platform =>
  document.documentElement.dataset.platform === "native" ? "native" : "web";

// Crawlers and the first hydration pass see the web docs.
const serverPlatform = (): Platform => "web";

function choose(value: string) {
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

/**
 * Web and React Native versions of one component. Both panels render on the
 * server; which one shows follows `<html data-platform>`, so a reader who
 * chose React Native never sees the web docs flash first. The choice follows
 * the reader to other component pages, and `?platform=native` links to it.
 */
export function PlatformTabs({
  web,
  native,
}: {
  web: ReactNode;
  native: ReactNode;
}) {
  const platform = useSyncExternalStore(subscribe, readPlatform, serverPlatform);

  return (
    <>
      <Tabs value={platform} onValueChange={choose} variant="segment">
        <TabsList aria-label="Platform" className="mt-6">
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="native">React Native</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="[html[data-platform=native]_&]:hidden">{web}</div>
      <div className="hidden [html[data-platform=native]_&]:block">{native}</div>
    </>
  );
}
