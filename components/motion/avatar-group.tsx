"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ComponentPropsWithRef, useState } from "react";
import { Tooltip, TooltipProvider } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface AvatarGroupMember {
  id: string;
  name: string;
  /** Image URL. Without one, or if it fails to load, initials show. */
  src?: string;
}

const SIZES = {
  sm: { box: "size-7 text-[10px]", px: 28 },
  md: { box: "size-9 text-xs", px: 36 },
  lg: { box: "size-11 text-sm", px: 44 },
} as const;

type AvatarSize = keyof typeof SIZES;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

export interface AvatarProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  name: string;
  src?: string;
  size?: AvatarSize;
}

/** One avatar: the image, or initials when there is no image or it fails. */
export function Avatar({ name, src, size = "md", className, ...props }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const showImage = src && failedSrc !== src;
  return (
    <span
      {...props}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-card font-medium text-muted-foreground ring-2 ring-background select-none",
        SIZES[size].box,
        className,
      )}
    >
      {showImage ? (
        // biome-ignore lint/performance/noImgElement: a portable component; avatars come from any host and fall back to initials on error
        <img
          src={src}
          alt={name}
          draggable={false}
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      ) : (
        <>
          <span aria-hidden="true">{initials(name)}</span>
          <span className="sr-only">{name}</span>
        </>
      )}
    </span>
  );
}

export interface AvatarGroupProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  members: AvatarGroupMember[];
  /** Avatars shown before the rest collapse into a +N count. */
  max?: number;
  size?: AvatarSize;
  /** Whether every member is shown. Pair with `onExpandedChange`. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Accessible name for the list, such as "Project members". */
  label?: string;
}

/**
 * Overlapping avatars that fan apart on hover, lift the one under the pointer
 * with its name, and expand from a +N count to show everyone.
 */
export function AvatarGroup({
  members,
  max = 4,
  size = "md",
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  label = "Members",
  className,
  ...props
}: AvatarGroupProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = expanded ?? internalExpanded;
  const [spread, setSpread] = useState(false);
  const [lifted, setLifted] = useState<string | null>(null);

  const limit = Math.max(1, max);
  const overflow = Math.max(0, members.length - limit);
  const visible = isExpanded ? members : members.slice(0, limit);
  const px = SIZES[size].px;
  // Avatars overlap by a third of their width, and hovering opens that up.
  const overlap = Math.round(px / 3);
  const fan = !reduce && canHover && spread;

  const toggle = () => {
    const next = !isExpanded;
    if (expanded === undefined) setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <TooltipProvider skipDelay={400}>
      <div
        {...props}
        onPointerEnter={(event) => {
          props.onPointerEnter?.(event);
          if (event.pointerType === "mouse") setSpread(true);
        }}
        onPointerLeave={(event) => {
          props.onPointerLeave?.(event);
          setSpread(false);
          setLifted(null);
        }}
        className={cn("inline-flex items-center", className)}
      >
        <ul aria-label={label} className="relative flex items-center">
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((member, index) => (
              <motion.li
                key={member.id}
                layout={reduce ? false : "position"}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: reduce ? 1 : 0.6,
                  transition: { duration: 0.14, ease: EASE_OUT },
                }}
                transition={{ layout: SPRING_LAYOUT, scale: SPRING_LAYOUT, opacity: { duration: 0.18, ease: EASE_OUT } }}
                // Later avatars sit on top, except the lifted one.
                style={{
                  marginLeft: index === 0 ? 0 : -overlap,
                  zIndex: lifted === member.id ? visible.length + 1 : index,
                  position: "relative",
                }}
              >
                <Tooltip content={member.name} side="top">
                  <motion.span
                    className="block rounded-full"
                    onPointerEnter={() => setLifted(member.id)}
                    animate={{
                      x: fan ? index * (overlap / 2) : 0,
                      y: fan && lifted === member.id ? -4 : 0,
                      scale: fan && lifted === member.id ? 1.08 : 1,
                    }}
                    transition={SPRING_LAYOUT}
                  >
                    <Avatar name={member.name} src={member.src} size={size} />
                  </motion.span>
                </Tooltip>
              </motion.li>
            ))}
            {overflow > 0 ? (
              <motion.li
                key="overflow"
                layout={reduce ? false : "position"}
                transition={{ layout: SPRING_LAYOUT }}
                style={{ marginLeft: -overlap, zIndex: visible.length, position: "relative" }}
              >
                <motion.span
                  className="block"
                  animate={{ x: fan ? visible.length * (overlap / 2) : 0 }}
                  transition={SPRING_LAYOUT}
                >
                  <motion.button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? "Show fewer members" : `Show ${overflow} more members`}
                    onClick={toggle}
                    whileTap={reduce ? undefined : { scale: 0.92 }}
                    transition={SPRING_PRESS}
                    className={cn(
                      "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-foreground font-medium text-background tabular-nums ring-2 ring-background outline-none focus-visible:ring-ring",
                      SIZES[size].box,
                    )}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span
                        key={isExpanded ? "less" : "more"}
                        aria-hidden="true"
                        initial={{ opacity: 0, y: reduce ? 0 : isExpanded ? 8 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduce ? 0 : isExpanded ? -8 : 8 }}
                        transition={{ duration: 0.16, ease: EASE_OUT }}
                      >
                        {isExpanded ? "−" : `+${overflow}`}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </motion.span>
              </motion.li>
            ) : null}
          </AnimatePresence>
        </ul>
      </div>
    </TooltipProvider>
  );
}
