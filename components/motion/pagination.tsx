"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  useId,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { PresenceGate, type PresenceGateRenderProps } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

type PaginationItem = number | "ellipsis-start" | "ellipsis-end";

/**
 * The pages to show: `boundaries` pages at each end, `siblings` either side of
 * the current page, and an ellipsis for every gap of two or more pages. The
 * result keeps one length while the current page moves, so the row never
 * changes width as you page through.
 */
export function paginationRange(
  page: number,
  totalPages: number,
  siblings = 1,
  boundaries = 1,
): PaginationItem[] {
  const range = (start: number, end: number) =>
    Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  // Boundaries, siblings, the current page and two ellipses.
  const slots = boundaries * 2 + siblings * 2 + 3;
  if (totalPages <= slots) return range(1, totalPages);

  const left = Math.max(page - siblings, boundaries);
  const right = Math.min(page + siblings, totalPages - boundaries);
  const showStart = left > boundaries + 2;
  const showEnd = right < totalPages - (boundaries + 1);

  if (!showStart && showEnd) {
    return [
      ...range(1, siblings * 2 + boundaries + 2),
      "ellipsis-end",
      ...range(totalPages - boundaries + 1, totalPages),
    ];
  }
  if (showStart && !showEnd) {
    return [
      ...range(1, boundaries),
      "ellipsis-start",
      ...range(totalPages - (boundaries + 1 + siblings * 2), totalPages),
    ];
  }
  return [
    ...range(1, boundaries),
    "ellipsis-start",
    ...range(left, right),
    "ellipsis-end",
    ...range(totalPages - boundaries + 1, totalPages),
  ];
}

export interface PaginationProps
  extends Omit<ComponentPropsWithRef<"nav">, "onChange" | "children"> {
  totalPages: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown either side of the current one. */
  siblings?: number;
  /** Pages always shown at each end. */
  boundaries?: number;
  /** Pages an ellipsis jumps when pressed. */
  jump?: number;
  /**
   * Render pages as links. Each control still calls `onPageChange`, so a
   * client router can update state while the href keeps the page shareable.
   */
  getHref?: (page: number) => string;
  /** Render your router's Link, spreading these props onto it. */
  renderLink?: (props: ComponentPropsWithRef<"a">) => ReactElement;
}

const CONTROL =
  "relative inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm tabular-nums sm:h-9 sm:min-w-9 outline-none transition-[color,background-color,transform] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.94] motion-reduce:active:scale-100";

export function Pagination({
  totalPages,
  page,
  defaultPage = 1,
  onPageChange,
  siblings = 1,
  boundaries = 1,
  jump = 5,
  getHref,
  renderLink,
  className,
  "aria-label": ariaLabel = "Pagination",
  ...props
}: PaginationProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const total = Math.max(1, Math.floor(totalPages));
  const clamp = (value: number) => Math.min(total, Math.max(1, Math.round(value)));
  const [internal, setInternal] = useState(() => clamp(defaultPage));
  const current = clamp(page ?? internal);

  const go = (next: number) => {
    const target = clamp(next);
    if (target === current) return;
    if (page === undefined) setInternal(target);
    onPageChange?.(target);
  };

  // One control: a link when hrefs are given, otherwise a button.
  const control = (
    target: number,
    {
      label,
      current: isCurrent = false,
      disabled = false,
      className: controlClass,
      children,
      gate,
    }: {
      label: string;
      current?: boolean;
      disabled?: boolean;
      className?: string;
      children: ReactNode;
      /** Releases a control the moment it starts leaving. */
      gate?: PresenceGateRenderProps["gate"];
    },
  ) => {
    const shared = {
      ...gate,
      "aria-label": label,
      "aria-current": isCurrent ? ("page" as const) : undefined,
      className: cn(CONTROL, controlClass),
      children,
    };
    // A disabled control is always a button: a link cannot be disabled.
    if (getHref && !disabled) {
      const linkProps: ComponentPropsWithRef<"a"> = {
        ...shared,
        href: getHref(target),
        onClick: (event) => {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          go(target);
        },
      };
      return renderLink ? renderLink(linkProps) : <a {...linkProps} />;
    }
    return (
      <button type="button" disabled={disabled} onClick={() => go(target)} {...shared} />
    );
  };

  const items = paginationRange(current, total, siblings, boundaries);
  const fade = { duration: reduce ? 0.12 : 0.16, ease: EASE_OUT };

  return (
    <nav {...props} aria-label={ariaLabel} className={cn("flex", className)}>
      <LayoutGroup id={id}>
        <ul className="relative flex items-center gap-0.5 sm:gap-1">
          <li>
            {control(current - 1, {
              label: "Previous page",
              disabled: current === 1,
              className:
                "text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
              children: <ChevronLeft aria-hidden="true" className="size-4" />,
            })}
          </li>
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => {
              if (typeof item !== "number") {
                const back = item === "ellipsis-start";
                const Chevrons = back ? ChevronsLeft : ChevronsRight;
                return (
                  <motion.li
                    key={item}
                    layout={reduce ? false : "position"}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: fade }}
                    transition={{ layout: SPRING_LAYOUT, opacity: fade }}
                  >
                    <PresenceGate>
                    {({ gate }) => control(current + (back ? -jump : jump), {
                      gate,
                      label: back ? `Back ${jump} pages` : `Forward ${jump} pages`,
                      className: "group text-muted-foreground hover:text-foreground",
                      children: (
                        <>
                          {/* Hover or focus turns the dots into the jump's direction. */}
                          <span
                            aria-hidden="true"
                            className="transition-[opacity,transform] duration-150 ease-out group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0 motion-reduce:transform-none"
                          >
                            …
                          </span>
                          <Chevrons
                            aria-hidden="true"
                            className="absolute size-4 scale-75 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transform-none"
                          />
                        </>
                      ),
                    })}
                    </PresenceGate>
                  </motion.li>
                );
              }
              const isCurrent = item === current;
              return (
                <motion.li
                  key={item}
                  layout={reduce ? false : "position"}
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduce ? 1 : 0.8, transition: fade }}
                  transition={{ layout: SPRING_LAYOUT, opacity: fade, scale: SPRING_LAYOUT }}
                >
                  {/* An exiting number keeps its layout spring after it has
                      faded; the gate stops it catching clicks or focus. */}
                  <PresenceGate>
                  {({ gate }) => control(item, {
                    gate,
                    label: `Page ${item}`,
                    current: isCurrent,
                    className: isCurrent
                      ? "font-medium text-background"
                      : "text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground",
                    children: (
                      <>
                        {isCurrent ? (
                          <motion.span
                            aria-hidden="true"
                            layoutId={reduce ? undefined : "pagination-current"}
                            transition={SPRING_LAYOUT}
                            className="absolute inset-0 rounded-full bg-foreground"
                          />
                        ) : null}
                        <span className="relative">{item}</span>
                      </>
                    ),
                  })}
                  </PresenceGate>
                </motion.li>
              );
            })}
          </AnimatePresence>
          <li>
            {control(current + 1, {
              label: "Next page",
              disabled: current === total,
              className:
                "text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
              children: <ChevronRight aria-hidden="true" className="size-4" />,
            })}
          </li>
        </ul>
      </LayoutGroup>
    </nav>
  );
}
