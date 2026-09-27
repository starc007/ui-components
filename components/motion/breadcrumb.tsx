"use client";

import { ChevronRight, Ellipsis } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import {
  Children,
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  useId,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type BreadcrumbProps = ComponentPropsWithRef<"nav">;

/** A navigation landmark. Keep it mounted while the route changes. */
export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  const id = useId();
  return (
    <nav aria-label="Breadcrumb" {...props} className={cn("min-w-0", className)}>
      <LayoutGroup id={id}>{children}</LayoutGroup>
    </nav>
  );
}

export type BreadcrumbListProps = ComponentPropsWithRef<"ol"> & {
  /** Maximum visible slots, including the ellipsis. Minimum 3; Infinity disables collapsing. */
  maxItems?: number;
  /** Accessible label for the hidden ancestor disclosure. */
  overflowLabel?: string;
};

/** Pass keyed BreadcrumbItems directly so entering and leaving routes animate. */
export function BreadcrumbList({ className, children, maxItems = 4, overflowLabel = "Show hidden paths", ...props }: BreadcrumbListProps) {
  const items = Children.toArray(children);
  const limit = Number.isFinite(maxItems) ? Math.max(3, Math.floor(maxItems)) : 4;
  const collapse = maxItems !== Infinity && items.length > limit;
  const tailCount = limit - 2;
  const visible = collapse ? [
    items[0],
    <BreadcrumbItem key="breadcrumb-overflow">
      <BreadcrumbSeparator />
      <BreadcrumbEllipsis label={overflowLabel}>
        {items.slice(1, -tailCount)}
      </BreadcrumbEllipsis>
    </BreadcrumbItem>,
    ...items.slice(-tailCount),
  ] : items;
  return (
    <ol
      {...props}
      className={cn("relative flex flex-wrap items-center gap-x-1 gap-y-1 text-sm", className)}
    >
      <AnimatePresence initial={false} mode="popLayout">{visible}</AnimatePresence>
    </ol>
  );
}

export type BreadcrumbItemProps = HTMLMotionProps<"li">;

/** Use a stable route key; put its optional separator inside this item. */
export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, style, children, ...props }, ref) {
    const reduce = useReducedMotion();
    const present = useIsPresent();
    return (
      <motion.li
        ref={ref}
        layout={reduce ? false : "position"}
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 0, transition: { duration: 0.12, ease: EASE_OUT } }}
        transition={{ duration: 0.2, ease: EASE_OUT, layout: SPRING_LAYOUT }}
        {...props}
        inert={!present}
        aria-hidden={!present || undefined}
        style={{ ...style, pointerEvents: present ? style?.pointerEvents : "none" }}
        className={cn("relative inline-flex min-w-0 max-w-full items-center gap-1", className)}
      >
        {children}
      </motion.li>
    );
  },
);

export type BreadcrumbLinkProps = ComponentPropsWithRef<"a"> & {
  /** Render your router's Link, spreading these props onto it. */
  render?: (props: ComponentPropsWithRef<"a">) => ReactElement;
};

export function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  const linkProps = {
    ...props,
    className: cn(
      "inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-2 font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:size-3.5 [&>svg]:shrink-0",
      className,
    ),
  };
  return render ? render(linkProps) : <a {...linkProps} />;
}

export type BreadcrumbPageProps = ComponentPropsWithRef<"span">;

export function BreadcrumbPage({ className, children, ...props }: BreadcrumbPageProps) {
  return (
    <span
      {...props}
      aria-current="page"
      className={cn(
        "relative isolate inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-2 font-medium text-foreground [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3.5 [&>svg]:shrink-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

export type BreadcrumbSeparatorProps = ComponentPropsWithRef<"span">;

/** Decorative separator, placed inside the following BreadcrumbItem. */
export function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      data-breadcrumb-separator=""
      className={cn("inline-flex shrink-0 items-center text-muted-foreground/50 [&>svg]:size-3.5 rtl:rotate-180", className)}
    >
      {children ?? <ChevronRight />}
    </span>
  );
}


export interface BreadcrumbEllipsisProps {
  /** Hidden BreadcrumbItems, in path order. */
  children: ReactNode;
  className?: string;
  label?: string;
}

/** Hover disclosure with click/touch toggle and keyboard access to ancestor links. */
export function BreadcrumbEllipsis({ children, className, label = "Show hidden paths" }: BreadcrumbEllipsisProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<{ align: "start" | "end"; side: "top" | "bottom"; width: number }>({ align: "start", side: "bottom", width: 224 });
  const canHover = useHoverCapable();
  const present = useIsPresent();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLOListElement>(null);
  const focusOnOpen = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = trigger.current?.getBoundingClientRect();
      if (!rect) return;
      const right = window.innerWidth - rect.left - 8;
      const left = rect.right - 8;
      const align = right < 224 && left > right ? "end" : "start";
      const below = window.innerHeight - rect.bottom;
      setPlacement({
        align,
        side: below < 280 && rect.top > below ? "top" : "bottom",
        width: Math.max(32, Math.min(224, align === "start" ? right : left)),
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const leave = () => {
    cancelClose();
    // Allow the pointer to cross the gap between the trigger and portal.
    closeTimer.current = setTimeout(() => {
      if (!panel.current?.contains(document.activeElement) && document.activeElement !== trigger.current) setOpen(false);
    }, 160);
  };
  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && event.target !== trigger.current && !panel.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  return (
    <MorphPopover open={open && present} onOpenChange={setOpen} className={cn(className)}>
      <span
        onPointerEnter={(event) => {
          cancelClose();
          if (canHover && event.pointerType === "mouse") {
            focusOnOpen.current = false;
            setOpen(true);
          }
        }}
        onPointerLeave={leave}
      >
        <MorphPopoverTrigger>
          <button
            ref={trigger}
            type="button"
            aria-label={label}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={(event) => { focusOnOpen.current = event.detail === 0; }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusOnOpen.current = true;
                setOpen(true);
                panel.current?.querySelector<HTMLElement>("a[href],button")?.focus();
              }
            }}
          >
            <Ellipsis aria-hidden="true" className="size-4" />
          </button>
        </MorphPopoverTrigger>
        <MorphPopoverContent align={placement.align} side={placement.side} radius={10} sideOffset={6} className="p-1.5">
          <BreadcrumbOverflowPaths
            ref={panel}
            style={{ width: placement.width - 14 }}
            focusOnOpen={focusOnOpen}
            onPointerEnter={() => { cancelClose(); setOpen(true); }}
            onPointerLeave={leave}
            onClick={(event) => {
              if ((event.target as Element).closest("a[href]")) setOpen(false);
            }}
          >
            {children}
          </BreadcrumbOverflowPaths>
        </MorphPopoverContent>
      </span>
    </MorphPopover>
  );
}

function BreadcrumbOverflowPaths({ focusOnOpen, ref, ...props }: ComponentPropsWithRef<"ol"> & { focusOnOpen: { current: boolean } }) {
  const localRef = useRef<HTMLOListElement>(null);
  useLayoutEffect(() => {
    if (!focusOnOpen.current) return;
    const focus = () => localRef.current?.querySelector<HTMLElement>("a[href],button")?.focus();
    focus();
    // The portal becomes visible after its parent's layout measurement.
    const frame = requestAnimationFrame(() => {
      focus();
      focusOnOpen.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [focusOnOpen]);
  return (
    <ol
      {...props}
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") return ref(node);
        if (ref) ref.current = node;
      }}
      className="flex max-h-64 flex-col gap-0.5 overflow-y-auto [&>li]:w-full [&_a]:w-full [&_a]:py-1 [&_a]:[overflow-wrap:anywhere] [&_[data-breadcrumb-separator]]:hidden"
    />
  );
}
