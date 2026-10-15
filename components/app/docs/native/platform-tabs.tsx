import type { ReactNode } from "react";
import { PlatformSwitch } from "@/components/app/docs/native/platform-switch";

/**
 * Web and React Native versions of one component. Both panels render on the
 * server; which one shows follows `<html data-platform>`, so a reader who
 * chose React Native never sees the web docs flash first. Wide screens pick
 * the platform from the right sidebar; narrower ones get the switch inline.
 */
export function PlatformTabs({
  web,
  native,
}: {
  web: ReactNode;
  native: ReactNode;
}) {
  return (
    <>
      <div className="mt-6 xl:hidden">
        <PlatformSwitch />
      </div>
      <div className="[html[data-platform=native]_&]:hidden">{web}</div>
      <div className="hidden [html[data-platform=native]_&]:block">{native}</div>
    </>
  );
}
