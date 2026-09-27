"use client";

import { ArrowUpRight, Folder, Home } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/motion/breadcrumb";

const PATH = ["Workspace", "Projects", "Website", "Components"];

export function BreadcrumbPreview() {
  const [depth, setDepth] = useState(2);
  const currentRef = useRef<HTMLSpanElement>(null);
  const restoreFocus = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (restoreFocus.current === depth) {
      currentRef.current?.focus();
      restoreFocus.current = null;
    }
  }, [depth]);

  return (
    <div className="w-full max-w-lg space-y-8 px-4">
      <Breadcrumb>
        <BreadcrumbList>
          {PATH.slice(0, depth + 1).map((label, index) => (
            <BreadcrumbItem key={label}>
              {index > 0 && <BreadcrumbSeparator />}
              {index === depth ? (
                <BreadcrumbPage ref={currentRef} tabIndex={-1}>
                  {index === 0 && <Home aria-hidden="true" />}
                  {label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={`#${label.toLowerCase()}`}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                    event.preventDefault();
                    restoreFocus.current = index;
                    setDepth(index);
                  }}
                >
                  {index === 0 && <Home aria-hidden="true" />}
                  {label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="border-t border-border/60 pt-5">
        {depth < PATH.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              restoreFocus.current = depth + 1;
              setDepth((value) => Math.min(value + 1, PATH.length - 1));
            }}
            className="flex w-full items-center gap-3 rounded-lg border border-border/60 px-4 py-3 text-start text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Folder aria-hidden="true" className="size-4 text-muted-foreground" />
            <span className="flex-1">{PATH[depth + 1]}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </button>
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">You’re in Components. Choose a parent to go back.</p>
        )}
      </div>
    </div>
  );
}
