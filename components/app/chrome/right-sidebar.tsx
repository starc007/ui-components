"use client";

import { usePathname } from "next/navigation";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { ProCard } from "@/components/app/docs/pro-card";
import { SponsorCard } from "@/components/app/docs/sponsor-card";
import nativeSlugs from "@/lib/native/slugs.json";

const NATIVE = new Set<string>(nativeSlugs);

/** The component slug of a /components/<category>/<slug> page. */
function componentSlug(pathname: string) {
  const match = /^\/components\/[^/]+\/([^/]+)\/?$/.exec(pathname);
  return match?.[1] ?? null;
}

export function RightSidebar() {
  const slug = componentSlug(usePathname());
  const hasNative = slug !== null && NATIVE.has(slug);

  return (
    <>
      {hasNative ? <PlatformSwitch layout="block" className="mb-4" /> : null}
      <ProCard />
      <SponsorCard />
    </>
  );
}
