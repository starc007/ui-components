"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { usePathname, useRouter } from "@/i18n/navigation";

const SPACES = [
  { value: "components", href: "/components/motion" },
  { value: "blocks", href: "/components/blocks" },
  { value: "agents", href: "/components/agents" },
] as const;

/** Top-level space switcher — the library's own Tabs in controlled mode, driven by the route. */
export function HeaderTabs({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("Chrome.header");
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname.startsWith("/components/blocks")
    ? "blocks"
    : pathname.startsWith("/components/agents")
      ? "agents"
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
            {t(s.value)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
