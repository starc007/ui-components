"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";

export type NavLink = { label: string; href: string };

export interface NavbarProps {
  brand?: string;
  links: NavLink[];
  cta?: { label: string; href: string };
  className?: string;
}

export function Navbar({ brand = "Brand", links, cta, className }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-(--color-border) bg-(--color-bg)/70 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-5 w-5 rounded-md bg-gradient-to-br from-(--color-accent) to-(--color-violet)" />
          {brand}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-(--color-fg-muted) hover:text-(--color-fg) transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {cta ? (
            <Link
              href={cta.href}
              className="hidden h-9 items-center rounded-lg bg-(--color-fg) px-4 text-sm font-medium text-(--color-bg) hover:bg-(--color-fg)/90 md:inline-flex"
            >
              {cta.label}
            </Link>
          ) : null}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-(--color-fg-muted) hover:text-(--color-fg) md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-(--color-border) md:hidden"
          >
            <div className="flex flex-col px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-(--color-fg) hover:bg-(--color-bg-elev)"
                >
                  {l.label}
                </Link>
              ))}
              {cta ? (
                <Link
                  href={cta.href}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex h-9 items-center justify-center rounded-lg bg-(--color-fg) px-4 text-sm font-medium text-(--color-bg)"
                >
                  {cta.label}
                </Link>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
