"use client";

import { motion } from "motion/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";
import {
  AnimatedSidebarPanelContext,
  type SidebarSide,
  useAnimatedSidebar,
} from "./context";
import { PANEL_TRANSITION, REDUCED_TRANSITION } from "./motion";

export function MobileSidebar({
  ariaLabel,
  children,
  className,
  side,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  side: SidebarSide;
}) {
  const context = useAnimatedSidebar();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // The sheet is mounted for as long as the viewport is mobile, so it hides
  // itself while closed rather than sitting there transparent and interactive.
  // Opening shows it in the same commit that starts the slide - a delayed show
  // would run the focus effect below against a still-hidden panel, and focus()
  // on a hidden element is ignored. Closing waits for the slide to finish, and
  // the panel's own exit tells us when that is: no duration to keep in sync.
  const [hidden, setHidden] = useState(!context.openMobile);
  // The completion callback fires for the open slide too, and it reads state
  // from whenever motion settles: a ref keeps it on the current one.
  const openMobileRef = useRef(context.openMobile);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    openMobileRef.current = context.openMobile;
    if (context.openMobile) setHidden(false);
  }, [context.openMobile]);

  // A modal sheet: focus moves in, Tab stays inside, Escape closes, and focus
  // returns to the opener. The fixed body lock holds on iOS Safari too.
  const { openMobile, setOpenMobile } = context;
  const closeMobile = useCallback(() => setOpenMobile(false), [setOpenMobile]);
  useFocusTrap(openMobile && mounted, panelRef, { onEscape: closeMobile });
  useScrollLock(openMobile, { fixed: true });

  if (!mounted) return null;

  // This container groups the sheet for hiding and the z-index and carries no
  // box: both children are `fixed` and resolve against the viewport themselves.
  // The scrim spans the viewport edges but paints a colour, and the panel is
  // inset off one side and paints its own surface, so no layer here is a
  // transparent edge-spanning one.
  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-50 size-0 md:hidden",
        hidden && !context.openMobile ? "invisible" : "visible",
      )}
    >
      <motion.button
        type="button"
        aria-label={context.t("close")}
        tabIndex={context.openMobile ? 0 : -1}
        initial={false}
        animate={{ opacity: context.openMobile ? 1 : 0 }}
        transition={
          context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION
        }
        onClick={() => context.setOpenMobile(false)}
        className={cn(
          "fixed inset-0 bg-black/40",
          context.openMobile
            ? "pointer-events-auto"
            : "pointer-events-none",
        )}
      />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-hidden={!context.openMobile}
        inert={!context.openMobile}
        tabIndex={-1}
        data-mobile="true"
        data-state={context.openMobile ? "expanded" : "collapsed"}
        data-side={side}
        initial={false}
        animate={{
          opacity: context.reduce
            ? context.openMobile
              ? 1
              : 0
            : 1,
          x: context.reduce
            ? 0
            : context.openMobile
              ? "0%"
              : side === "left"
                ? "-100%"
                : "100%",
        }}
        transition={
          context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION
        }
        onAnimationComplete={() => {
          if (!openMobileRef.current) setHidden(true);
        }}
        className={cn(
          "pointer-events-auto fixed inset-y-0 flex h-dvh w-(--sidebar-width-mobile) max-w-[88vw] flex-col overflow-hidden",
          "border-border bg-background shadow-2xl will-change-transform",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
          !context.openMobile && "pointer-events-none",
          className,
        )}
      >
        <AnimatedSidebarPanelContext.Provider
          value={{ collapsed: false, collapsible: "none", side }}
        >
          {children}
        </AnimatedSidebarPanelContext.Provider>
      </motion.div>
    </div>,
    document.body,
  );
}
