"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "use-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const THEMES = [
  { value: "light", label: "lightTheme", icon: Sun },
  { value: "dark", label: "darkTheme", icon: Moon },
  { value: "system", label: "systemTheme", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("Chrome.theme");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Tabs
      value={mounted ? (theme ?? "dark") : "dark"}
      onValueChange={setTheme}
      variant="pill"
      className={className}
    >
      <TabsList className="gap-0">
        {THEMES.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            indicatorClassName="bg-background"
            className="size-7 p-0 aria-[selected=true]:text-foreground [&_[data-tabs-label]]:text-foreground sm:size-8"
          >
            <Icon aria-hidden="true" className="size-4" />
            <span className="sr-only">{t(label)}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
