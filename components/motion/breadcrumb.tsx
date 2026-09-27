"use client";

import { ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useIsPresent,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import {
  forwardRef,
  useId,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";
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

export type BreadcrumbListProps = ComponentPropsWithRef<"ol">;

/** Pass keyed BreadcrumbItems directly so entering and leaving routes animate. */
export function BreadcrumbList({ className, children, ...props }: BreadcrumbListProps) {
  return (
    <ol
      {...props}
      className={cn("relative flex flex-wrap items-center gap-x-1 gap-y-1 text-sm", className)}
    >
      <AnimatePresence initial={false} mode="popLayout">{children}</AnimatePresence>
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
        initial={{ opacity: 0, x: reduce ? 0 : -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: reduce ? 0 : -4, transition: { duration: 0.12, ease: EASE_OUT } }}
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
      "inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:size-3.5 [&>svg]:shrink-0",
      className,
    ),
  };
  return render ? render(linkProps) : <a {...linkProps} />;
}

export type BreadcrumbPageProps = ComponentPropsWithRef<"span">;

export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      {...props}
      aria-current="page"
      className={cn(
        "inline-flex min-h-8 min-w-0 items-center gap-1.5 rounded-md bg-muted/70 px-2 font-medium text-foreground [overflow-wrap:anywhere] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3.5 [&>svg]:shrink-0",
        className,
      )}
    />
  );
}

export type BreadcrumbSeparatorProps = ComponentPropsWithRef<"span">;

/** Decorative separator, placed inside the following BreadcrumbItem. */
export function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center text-muted-foreground/50 [&>svg]:size-3.5 rtl:rotate-180", className)}
    >
      {children ?? <ChevronRight />}
    </span>
  );
}
