"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const SPACES = [
  { value: "components", label: "Components", href: "/components/motion" },
  { value: "blocks", label: "Blocks", href: "/components/blocks" },
];

/** Top-level space switcher — the library's own Tabs in controlled mode, driven by the route. */
export function HeaderTabs({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.startsWith("/components/blocks")
    ? "blocks"
    : pathname.startsWith("/components")
      ? "components"
      : "";

  return (
    <Tabs
      value={active}
      onValueChange={(v) => {
        const space = SPACES.find((s) => s.value === v);
        if (space) {
          router.push(space.href);
          onNavigate?.();
        }
      }}
    >
      <TabsList>
        {SPACES.map((s) => (
          <TabsTrigger key={s.value} value={s.value} className="text-xs">
            {s.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
