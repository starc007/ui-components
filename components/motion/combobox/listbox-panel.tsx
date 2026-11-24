"use client";

import { motion } from "motion/react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePopoverPortalPosition } from "@/components/motion/popover-position";
import { SPRING_MORPH } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type ListboxPanelSide = "top" | "bottom";
export type ListboxPanelAlign = "start" | "center" | "end";

const VIEWPORT_PADDING = 8;

export interface ListboxPanelPlacement {
  side?: ListboxPanelSide;
  align?: ListboxPanelAlign;
  sideOffset?: number;
  avoidCollisions?: boolean;
  className?: string;
}

/**
 * The portaled panel Combobox and Multi Select open into: anchored to the
 * field, flipped to the side with room, and grown out of the field on one
 * spring. Each component passes its own open state and refs, and `name` keeps
 * its `data-<name>-content` attribute and `--<name>-trigger-width` variable.
 */
export function ListboxPanel({
  name,
  open,
  reduce,
  triggerRef,
  contentRef,
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className,
}: ListboxPanelPlacement & {
  name: "combobox" | "multi-select";
  open: boolean;
  reduce: boolean;
  triggerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [actualSide, setActualSide] = useState<ListboxPanelSide>(side);
  const [morphReady, setMorphReady] = useState(false);
  const layout = usePopoverPortalPosition(triggerRef, measureRef, portalReady);

  useEffect(() => setPortalReady(true), []);
  useLayoutEffect(() => {
    if (!portalReady) return;
    const readyFrame = requestAnimationFrame(() => setMorphReady(true));
    return () => cancelAnimationFrame(readyFrame);
  }, [portalReady]);

  useLayoutEffect(() => {
    // Preserve the resolved side during exit, so top panels close upward.
    if (!open || !layout) return;
    if (!avoidCollisions) {
      setActualSide(side);
      return;
    }
    const below = window.innerHeight - (layout.trigger.top + layout.trigger.height);
    const above = layout.trigger.top;
    if (side === "bottom" && below < layout.content.height + sideOffset && above > below)
      setActualSide("top");
    else if (side === "top" && above < layout.content.height + sideOffset && below > above)
      setActualSide("bottom");
    else setActualSide(side);
  }, [avoidCollisions, open, layout, side, sideOffset]);

  if (!portalReady) return null;

  const triggerLeft = layout?.trigger.left ?? 0;
  const triggerWidth = layout?.trigger.width ?? 0;
  const contentWidth = layout?.content.width ?? triggerWidth;
  const desiredLeft =
    align === "end"
      ? triggerLeft + triggerWidth - contentWidth
      : align === "center"
        ? triggerLeft + (triggerWidth - contentWidth) / 2
        : triggerLeft;
  const maxLeft = Math.max(VIEWPORT_PADDING, window.innerWidth - contentWidth - VIEWPORT_PADDING);
  const left = Math.min(Math.max(desiredLeft, VIEWPORT_PADDING), maxLeft);
  const surfaceHeight = layout?.content.height ?? 0;
  const transition = reduce || !morphReady ? { duration: 0 } : SPRING_MORPH;

  return createPortal(
    <motion.div
      ref={contentRef}
      {...{ [`data-${name}-content`]: "" }}
      data-side={actualSide}
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={{
        height: open ? surfaceHeight : 0,
        opacity: open ? 1 : 0,
        y: open ? (actualSide === "bottom" ? sideOffset : -sideOffset) : 0,
      }}
      transition={transition}
      style={
        {
          left,
          top:
            actualSide === "bottom" && layout ? layout.trigger.top + layout.trigger.height : undefined,
          bottom: actualSide === "top" && layout ? window.innerHeight - layout.trigger.top : undefined,
          minWidth: triggerWidth,
          pointerEvents: open ? "auto" : "none",
          transformOrigin: actualSide === "bottom" ? "top" : "bottom",
          visibility: layout ? "visible" : "hidden",
          "--listbox-trigger-width": `${triggerWidth}px`,
          [`--${name}-trigger-width`]: `${triggerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        "fixed z-[9999] w-(--listbox-trigger-width) overflow-hidden rounded-2xl border border-border bg-background text-popover-foreground outline-none will-change-[height,transform]",
        className,
      )}
    >
      <motion.div ref={measureRef} initial={false} animate={{ opacity: open ? 1 : 0 }} transition={transition}>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
