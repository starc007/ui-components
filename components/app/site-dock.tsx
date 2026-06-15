"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Copy, Home, LayoutGrid, Mail, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Dock, DockItem, DockSeparator } from "@/components/motion/dock";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { Tooltip } from "@/components/motion/tooltip";
import { GithubIcon } from "@/components/app/icons";

export function SiteDock() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeIcon, setThemeIcon] = useState<"light" | "dark">("light");
  const [emailHovered, setEmailHovered] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";
  useEffect(() => {
    if (!mounted) return;
    setThemeIcon(isDark ? "dark" : "light");
  }, [isDark, mounted]);

  const isHome = pathname === "/";
  const isComponents = pathname.startsWith("/components");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
      <div className="pointer-events-auto">
        <Dock size={36} className="gap-0 border border-fg/5 px-1.5">
          <DockItem aria-label="Home" active={isHome}>
            <Tooltip
              content="Home"
              side="top"
              wrapperClassName="h-full w-full items-center justify-center"
            >
              <Link
                href="/"
                aria-label="Home"
                className="flex h-full w-full items-center justify-center"
              >
                <Home className="h-4 w-4" />
              </Link>
            </Tooltip>
          </DockItem>
          <DockItem aria-label="Components" active={isComponents}>
            <Tooltip
              content="Components"
              side="top"
              wrapperClassName="h-full w-full items-center justify-center"
            >
              <Link
                href="/components/motion"
                aria-label="Components"
                className="flex h-full w-full items-center justify-center"
              >
                <LayoutGrid className="h-4 w-4" />
              </Link>
            </Tooltip>
          </DockItem>
          <DockSeparator className="mx-0.5 h-4" />
          <DockItem aria-label="GitHub">
            <Tooltip
              content="GitHub"
              side="top"
              wrapperClassName="h-full w-full items-center justify-center"
            >
              <Link
                href="https://github.com/starc007/ui-components"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex h-full w-full items-center justify-center"
              >
                <GithubIcon className="h-4 w-4" />
              </Link>
            </Tooltip>
          </DockItem>
          <DockItem aria-label="Email">
            <Tooltip
              content={emailCopied ? "Copied!" : "saurabh10102@gmail.com"}
              side="top"
              wrapperClassName="h-full w-full items-center justify-center"
            >
              <button
                type="button"
                aria-label="Copy email"
                className="flex h-full w-full items-center justify-center"
                onPointerEnter={() => setEmailHovered(true)}
                onPointerLeave={() => setEmailHovered(false)}
                onClick={() => {
                  navigator.clipboard.writeText("saurabh10102@gmail.com");
                  setEmailCopied(true);
                  setTimeout(() => setEmailCopied(false), 2000);
                }}
              >
                <ActionSwapIcon
                  value={emailCopied ? "check" : emailHovered ? "copy" : "mail"}
                  animation="roll"
                  className="h-4 w-4"
                >
                  {emailCopied ? (
                    <Check className="h-4 w-4" />
                  ) : emailHovered ? (
                    <Copy className="h-4 w-4" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </ActionSwapIcon>
              </button>
            </Tooltip>
          </DockItem>
          <DockItem aria-label="Toggle theme">
            <Tooltip
              content={mounted && isDark ? "Light mode" : "Dark mode"}
              side="top"
              wrapperClassName="h-full w-full items-center justify-center"
            >
              <button
                type="button"
                onClick={() => {
                  const nextTheme = isDark ? "light" : "dark";
                  setThemeIcon(nextTheme);
                  setTheme(nextTheme);
                }}
                aria-label="Toggle theme"
                className="flex h-full w-full items-center justify-center"
              >
                {mounted ? (
                  <ActionSwapIcon
                    value={themeIcon}
                    animation="blur"
                    className="h-4 w-4"
                  >
                    {themeIcon === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </ActionSwapIcon>
                ) : (
                  <span className="h-4 w-4" />
                )}
              </button>
            </Tooltip>
          </DockItem>
        </Dock>
      </div>
    </div>
  );
}
