"use client";

import { usePathname } from "next/navigation";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";
import { ProCard } from "@/components/app/docs/pro-card";
import { ProMobileCard } from "@/components/app/docs/pro-mobile-card";
import { SponsorCard } from "@/components/app/docs/sponsor-card";
import { hasPlatformSwitch, isNativePath } from "@/lib/component-paths";

export function RightSidebar() {
  // Every component and category page offers the switch, so a reader who
  // chose React Native can always get back to the web docs.
  const pathname = usePathname();
  const isComponentPage = hasPlatformSwitch(pathname);

  return (
    <>
      {isComponentPage ? <PlatformSwitch layout="block" className="mb-4" /> : null}
      {isNativePath(pathname) ? <ProMobileCard /> : <ProCard />}
      <SponsorCard />
    </>
  );
}
