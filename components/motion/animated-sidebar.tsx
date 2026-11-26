"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";
import { SPRING_LAYOUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  AnimatedSidebarContext,
  AnimatedSidebarPanelContext,
  type AnimatedSidebarMessages,
  animatedSidebarMessages,
  type SidebarCollapsible,
  type SidebarSide,
  type SidebarVariant,
  useAnimatedSidebar,
  useAnimatedSidebarPanel,
} from "./animated-sidebar/context";
import { MobileSidebar } from "./animated-sidebar/mobile-sidebar";
import {
  PANEL_TRANSITION,
  REDUCED_TRANSITION,
  SIDEBAR_MORPH_TRANSITION,
  SUBMENU_ITEM_VARIANTS,
  SUBMENU_VARIANTS,
} from "./animated-sidebar/motion";
import { useIsMobile } from "./animated-sidebar/use-is-mobile";

export {
  AnimatedSidebarMenuSubButton,
  type AnimatedSidebarMenuSubButtonProps,
} from "./animated-sidebar/menu-sub-button";
export {
  AnimatedSidebarMenuButton,
  type AnimatedSidebarMenuButtonProps,
} from "./animated-sidebar/menu-button";
export {
  type AnimatedSidebarMessages,
  animatedSidebarMessages,
  useAnimatedSidebar,
} from "./animated-sidebar/context";

const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarProviderStyle = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-icon"?: string;
  "--sidebar-width-mobile"?: string;
};

export interface AnimatedSidebarProviderProps
  extends HTMLAttributes<HTMLDivElement> {
  /** Whether the desktop sidebar is expanded, for controlled use. */
  open?: boolean;
  /** Whether the desktop sidebar starts expanded when uncontrolled. Default: true */
  defaultOpen?: boolean;
  /** Called with the next state when the desktop sidebar expands or collapses. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the mobile drawer is open, for controlled use. */
  openMobile?: boolean;
  /** Whether the mobile drawer starts open when uncontrolled. Default: false */
  defaultOpenMobile?: boolean;
  /** Called with the next state when the mobile drawer opens or closes. */
  onOpenMobileChange?: (open: boolean) => void;
  /** Inline styles; set `--sidebar-width`, `--sidebar-width-icon` or `--sidebar-width-mobile` here. */
  style?: SidebarProviderStyle;
  /** Override any built-in string. */
  labels?: Partial<AnimatedSidebarMessages>;
}

export function AnimatedSidebarProvider({
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  className,
  style,
  labels,
  ...props
}: AnimatedSidebarProviderProps) {
  const t = useMessages("animatedSidebar", animatedSidebarMessages, labels);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalOpenMobile, setInternalOpenMobile] =
    useState(defaultOpenMobile);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopOpen = open ?? internalOpen;
  const mobileOpen = openMobile ?? internalOpenMobile;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  const setOpenMobile = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === undefined) setInternalOpenMobile(nextOpen);
      onOpenMobileChange?.(nextOpen);
    },
    [onOpenMobileChange, openMobile],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(!mobileOpen);
    else setOpen(!desktopOpen);
  }, [desktopOpen, isMobile, mobileOpen, setOpen, setOpenMobile]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggleSidebar]);

  return (
    <AnimatedSidebarContext.Provider
      value={{
        isMobile,
        layoutId: `${generatedId}-active`,
        open: desktopOpen,
        openMobile: mobileOpen,
        reduce,
        setOpen,
        setOpenMobile,
        state: desktopOpen ? "expanded" : "collapsed",
        toggleSidebar,
        triggerRef,
        t,
      }}
    >
      <div
        {...props}
        data-slot="sidebar-wrapper"
        data-state={desktopOpen ? "expanded" : "collapsed"}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.25rem",
          "--sidebar-width-mobile": "18rem",
          ...style,
        }}
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full min-w-0",
          className,
        )}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  );
}

export interface AnimatedSidebarProps
  extends Omit<HTMLMotionProps<"aside">, "children"> {
  children?: ReactNode;
  /** Which edge of the layout the sidebar sits on. Default: "left" */
  side?: SidebarSide;
  /** Panel style: bordered edge, floating card, or inset card. Default: "sidebar" */
  variant?: SidebarVariant;
  /** How it collapses: to an icon rail, fully off canvas, or never. Default: "icon" */
  collapsible?: SidebarCollapsible;
  /** Accessible name for the sidebar landmark. Default: "Sidebar" */
  ariaLabel?: string;
  /** Classes merged onto the inner panel that holds the content. */
  panelClassName?: string;
}

export const AnimatedSidebar = forwardRef<HTMLElement, AnimatedSidebarProps>(
  function AnimatedSidebar(
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon",
      ariaLabel: ariaLabelProp,
      children,
      className,
      panelClassName,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const context = useAnimatedSidebar();
    const ariaLabel = ariaLabelProp ?? context.t("label");
    const collapsed = collapsible !== "none" && !context.open;
    const offcanvas = collapsed && collapsible === "offcanvas";
    const width = offcanvas
      ? "0px"
      : collapsed
        ? "var(--sidebar-width-icon)"
        : "var(--sidebar-width)";

    if (context.isMobile) {
      return (
        <MobileSidebar
          ariaLabel={ariaLabel}
          className={className}
          side={side}
        >
          {children}
        </MobileSidebar>
      );
    }

    return (
      <motion.aside
        {...props}
        ref={forwardedRef}
        initial={false}
        aria-label={ariaLabel}
        data-slot="sidebar"
        data-state={collapsed ? "collapsed" : "expanded"}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        animate={{ width }}
        transition={
          context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION
        }
        style={style}
        className={cn(
          "group/sidebar relative hidden h-auto shrink-0 md:block will-change-[width]",
          "peer",
          side === "right" && "order-last",
          className,
        )}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: offcanvas ? 0 : 1,
            x: offcanvas ? (side === "left" ? "-100%" : "100%") : "0%",
          }}
          transition={
            context.reduce ? REDUCED_TRANSITION : PANEL_TRANSITION
          }
          className={cn(
            "sticky top-0 flex h-svh w-full flex-col overflow-hidden bg-background",
            collapsible === "offcanvas" && "w-[var(--sidebar-width)]",
            variant === "sidebar" &&
              (side === "left" ? "border-border border-r" : "border-border border-l"),
            variant === "floating" &&
              "m-2 h-[calc(100svh-1rem)] rounded-2xl border border-border shadow-sm",
            variant === "inset" && "m-2 h-[calc(100svh-1rem)] rounded-2xl",
            panelClassName,
          )}
        >
          <AnimatedSidebarPanelContext.Provider
            value={{ collapsed, collapsible, side }}
          >
            {children}
          </AnimatedSidebarPanelContext.Provider>
        </motion.div>
      </motion.aside>
    );
  },
);

export interface AnimatedSidebarTriggerProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const AnimatedSidebarTrigger = forwardRef<
  HTMLButtonElement,
  AnimatedSidebarTriggerProps
>(function AnimatedSidebarTrigger(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const expanded = context.isMobile ? context.openMobile : context.open;

  return (
    <button
      {...props}
      ref={(node) => {
        context.triggerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      type={type}
      aria-label={props["aria-label"] ?? context.t("toggle")}
      aria-expanded={expanded}
      data-slot="sidebar-trigger"
      data-state={expanded ? "expanded" : "collapsed"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleSidebar();
      }}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    />
  );
});

export interface AnimatedSidebarCloseProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const AnimatedSidebarClose = forwardRef<
  HTMLButtonElement,
  AnimatedSidebarCloseProps
>(function AnimatedSidebarClose(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();

  return (
    <button
      {...props}
      ref={forwardedRef}
      type={type}
      aria-label={props["aria-label"] ?? context.t("close")}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (context.isMobile) context.setOpenMobile(false);
        else context.setOpen(false);
      }}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    />
  );
});

export interface AnimatedSidebarRailProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const AnimatedSidebarRail = forwardRef<
  HTMLButtonElement,
  AnimatedSidebarRailProps
>(function AnimatedSidebarRail(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();

  return (
    <button
      {...props}
      ref={forwardedRef}
      type={type}
      data-side={panel.side}
      aria-label={props["aria-label"] ?? context.t("toggle")}
      title={context.t("toggle")}
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 outline-none md:block",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent after:transition-colors hover:after:bg-border",
        "data-[side=right]:right-0 data-[side=right]:translate-x-1/2 data-[side=left]:left-full",
        className,
      )}
    />
  );
});

export interface AnimatedSidebarInsetProps
  extends HTMLMotionProps<"main"> {}

export const AnimatedSidebarInset = forwardRef<
  HTMLElement,
  AnimatedSidebarInsetProps
>(function AnimatedSidebarInset({ className, ...props }, forwardedRef) {
  return (
    <motion.main
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-inset"
      className={cn(
        "relative flex min-h-svh min-w-0 flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:shadow-sm",
        className,
      )}
    />
  );
});

export const AnimatedSidebarHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarHeader({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-header"
      className={cn("flex shrink-0 flex-col gap-2 p-3", className)}
    />
  );
});

export const AnimatedSidebarContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarContent({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2",
        className,
      )}
    />
  );
});

export const AnimatedSidebarFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarFooter({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-footer"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-border border-t p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    />
  );
});

export const AnimatedSidebarGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroup({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-group"
      className={cn("flex w-full min-w-0 flex-col px-1 py-1.5", className)}
    />
  );
});

export const AnimatedSidebarGroupLabel = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroupLabel(
  { children, className, ...props },
  forwardedRef,
) {
  const { collapsed } = useAnimatedSidebarPanel();

  return (
    <div
      {...props}
      ref={forwardedRef}
      aria-hidden={collapsed}
      data-slot="sidebar-group-label"
      className={cn(
        "mb-1 h-7 overflow-hidden px-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-opacity",
        collapsed ? "opacity-0" : "opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
});

export const AnimatedSidebarGroupContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroupContent(
  { className, ...props },
  forwardedRef,
) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-group-content"
      className={cn("w-full min-w-0", className)}
    />
  );
});

export const AnimatedSidebarMenu = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function AnimatedSidebarMenu(
  { children, className, ...props },
  forwardedRef,
) {
  return (
    <SharedLayoutBg
      {...props}
      ref={forwardedRef as React.Ref<HTMLElement>}
      as="ul"
      inset={0}
      pillClassName="rounded-full bg-muted/70"
      pillContainerClassName="inset-y-auto top-0 h-9"
      data-slot="sidebar-menu"
      className={cn("flex w-full min-w-0 list-none flex-col gap-0.5", className)}
    >
      {children}
    </SharedLayoutBg>
  );
});

export const AnimatedSidebarMenuItem = forwardRef<
  HTMLLIElement,
  HTMLMotionProps<"li">
>(function AnimatedSidebarMenuItem({ className, ...props }, forwardedRef) {
  return (
    <motion.li
      {...props}
      ref={forwardedRef}
      layout="position"
      transition={SPRING_LAYOUT}
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
    />
  );
});

export interface AnimatedSidebarMenuSubProps
  extends Omit<HTMLMotionProps<"ul">, "children"> {
  /** Shows the submenu. It stays hidden while the sidebar is collapsed. */
  open: boolean;
  children?: ReactNode;
}

export const AnimatedSidebarMenuSub = forwardRef<
  HTMLUListElement,
  AnimatedSidebarMenuSubProps
>(function AnimatedSidebarMenuSub(
  { open, children, className, ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {open && !panel.collapsed ? (
        <motion.ul
          {...props}
          ref={forwardedRef}
          key="sidebar-submenu"
          variants={context.reduce ? undefined : SUBMENU_VARIANTS}
          initial={context.reduce ? false : "closed"}
          animate={context.reduce ? { opacity: 1 } : "open"}
          exit={context.reduce ? { opacity: 0 } : "closed"}
          transition={context.reduce ? { duration: 0.12 } : undefined}
          data-slot="sidebar-menu-sub"
          className={cn(
            "relative mt-1 ml-5 flex min-w-0 flex-col gap-0.5 border-border border-l pl-3",
            className,
          )}
        >
          {children}
        </motion.ul>
      ) : null}
    </AnimatePresence>
  );
});

export const AnimatedSidebarMenuSubItem = forwardRef<
  HTMLLIElement,
  HTMLMotionProps<"li">
>(function AnimatedSidebarMenuSubItem(
  { className, ...props },
  forwardedRef,
) {
  return (
    <motion.li
      {...props}
      ref={forwardedRef}
      variants={SUBMENU_ITEM_VARIANTS}
      data-slot="sidebar-menu-sub-item"
      className={cn("relative min-w-0", className)}
    />
  );
});
