"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";
import { GithubIcon } from "@/components/app/icons";

export function SiteDock() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="pointer-events-auto">
        <Dock className="border border-fg/5">
          <DockItem aria-label="Home" active={isHome}>
            <Link
              href="/"
              aria-label="Home"
              className="flex h-full w-full items-center justify-center"
            >
              <Home className="h-5 w-5" />
            </Link>
          </DockItem>
          <DockItem aria-label="Components" active={isComponents}>
            <Link
              href="/components/motion"
              aria-label="Components"
              className="flex h-full w-full items-center justify-center"
            >
              <LayoutGrid className="h-5 w-5" />
            </Link>
          </DockItem>
          <DockSeparator />
          <DockItem aria-label="GitHub">
            <Link
              href="https://github.com/starc007/ui-components"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="flex h-full w-full items-center justify-center"
            >
              <GithubIcon className="h-5 w-5" />
            </Link>
          </DockItem>
          <DockItem aria-label="Toggle theme">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className="flex h-full w-full items-center justify-center"
            >
              {mounted ? (
                isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <span className="h-5 w-5" />
              )}
            </button>
          </DockItem>
        </Dock>
      </div>
    </div>
  );
}
