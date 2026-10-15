"use client";

import { usePathname } from "next/navigation";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { ProCard } from "@/components/app/docs/pro-card";
import { SponsorCard } from "@/components/app/docs/sponsor-card";
import { hasPlatformSwitch } from "@/lib/component-paths";

export function RightSidebar() {
  // Every component and category page offers the switch, so a reader who
  // chose React Native can always get back to the web docs.
  const isComponentPage = hasPlatformSwitch(usePathname());

  return (
    <>
      {isComponentPage ? <PlatformSwitch layout="block" className="mb-4" /> : null}
      <ProCard />
      <SponsorCard />
    </>
  );
}
