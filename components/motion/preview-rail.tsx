"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface PreviewRailItem {
  id: string;
  label: string;
  description?: ReactNode;
  href: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

export interface PreviewRailProps {
  items: PreviewRailItem[];
  orientation?: "vertical" | "horizontal";
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
  renderPreview?: (item: PreviewRailItem) => ReactNode;
  children?: ReactNode;
  className?: string;
  railClassName?: string;
  previewClassName?: string;
}

function DefaultPreview({ item }: { item: PreviewRailItem }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="font-medium text-card-foreground">{item.label}</p>
      {item.description ? (
        <div className="mt-1 text-sm leading-6 text-muted-foreground">
          {item.description}
        </div>
      ) : null}
    </div>
  );
}

export function PreviewRail({
  items,
  orientation = "vertical",
  activeId,
  defaultActiveId,
  onActiveChange,
  renderPreview,
  children,
  className,
  railClassName,
  previewClassName,
}: PreviewRailProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId ?? items[0]?.id ?? "",
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const requestedActiveId = activeId ?? internalActiveId;
  const selectedId = items.some((item) => item.id === requestedActiveId)
    ? requestedActiveId
    : (items[0]?.id ?? "");
  const displayedId = hoveredId ?? focusedId ?? "";
  const displayedIndex = items.findIndex((item) => item.id === displayedId);
  const rowTemplate = items.length
    ? `repeat(${items.length}, 1.25rem)`
    : undefined;
  const isHorizontal = orientation === "horizontal";

  const selectItem = (id: string) => {
    if (activeId === undefined) setInternalActiveId(id);
    onActiveChange?.(id);
  };

  return (
    <motion.div
      layoutRoot
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedId(null);
        }
      }}
      className={cn(
        "isolate relative flex w-full overflow-visible",
        isHorizontal
          ? "min-h-64 flex-col items-center justify-center"
          : "min-h-80",
        className,
      )}
    >
      <nav
        aria-label="Section navigation"
        onPointerLeave={() => setHoveredId(null)}
        style={
          isHorizontal
            ? { gridTemplateColumns: rowTemplate }
            : { gridTemplateRows: rowTemplate }
        }
        className={cn(
          "relative z-10 grid shrink-0",
          isHorizontal
            ? "h-12 w-fit max-w-full self-center justify-center"
            : "w-12 content-center",
          railClassName,
        )}
      >
        {items.map((item, index) => {
          const selected = item.id === selectedId;
          const displayed = item.id === displayedId;
          const highlighted = displayed;
          const distance =
            displayedIndex < 0 ? Number.POSITIVE_INFINITY : Math.abs(index - displayedIndex);
          const scale = highlighted
            ? 1
            : distance === 1
              ? 0.68
              : distance === 2
                ? 0.44
                : 0.25;

          return (
            <a
              key={item.id}
              href={item.href}
              target={item.target}
              rel={
                item.rel ??
                (item.target === "_blank" ? "noreferrer noopener" : undefined)
              }
              aria-label={item.label}
              aria-current={selected ? "page" : undefined}
              onPointerEnter={() => {
                if (canHover) setHoveredId(item.id);
              }}
              onPointerDown={() => setFocusedId(null)}
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  setFocusedId(item.id);
                }
              }}
              onClick={() => selectItem(item.id)}
              className={cn(
                "relative flex text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                isHorizontal
                  ? "h-12 w-5 items-end justify-center"
                  : "h-5 w-12 items-center",
              )}
            >
              <motion.span
                aria-hidden="true"
                animate={isHorizontal ? { scaleY: scale } : { scaleX: scale }}
                transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                className={cn(
                  "block bg-current",
                  isHorizontal
                    ? "h-12 w-0.5 origin-bottom"
                    : "h-0.5 w-12 origin-left",
                  highlighted ? "text-foreground" : undefined,
                )}
              />
            </a>
          );
        })}
      </nav>

      <div
        aria-hidden="true"
        style={
          isHorizontal
            ? { gridTemplateColumns: rowTemplate }
            : { gridTemplateRows: rowTemplate }
        }
        className={cn(
          "pointer-events-none absolute z-50 grid",
          isHorizontal
            ? "top-1/2 left-1/2 h-5 w-fit max-w-full -translate-x-1/2 -translate-y-1/2 justify-center"
            : "inset-y-0 right-4 left-16 content-center",
        )}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative flex h-5 items-center",
              isHorizontal ? "w-5 justify-center" : undefined,
            )}
          >
            {item.id === displayedId ? (
              <div
                className={cn(
                  isHorizontal
                    ? "absolute bottom-12 left-1/2 w-72 -translate-x-1/2"
                    : "w-full max-w-sm",
                  previewClassName,
                )}
              >
                <motion.div
                  layoutId={`preview-rail-card-${uid}`}
                  transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={item.id}
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: 4, filter: "blur(6px)" }
                      }
                      animate={
                        reduce
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, filter: "blur(0px)" }
                      }
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              y: -2,
                              filter: "blur(4px)",
                              transition: {
                                duration: 0.12,
                                ease: EASE_OUT,
                              },
                            }
                      }
                      transition={{
                        duration: reduce ? 0 : 0.18,
                        ease: EASE_OUT,
                      }}
                    >
                      {renderPreview ? (
                        renderPreview(item)
                      ) : (
                        <DefaultPreview item={item} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {children ? (
        <div className="min-h-0 min-w-0 flex-1">{children}</div>
      ) : null}
    </motion.div>
  );
}
