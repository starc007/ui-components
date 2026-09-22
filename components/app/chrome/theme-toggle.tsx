"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const THEMES = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
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
            <span className="sr-only">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
