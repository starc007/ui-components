"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface SharedLayoutBgProps {
  children: ReactNode;
  className?: string;
  /** Tailwind class applied to the moving pill. Defaults to a subtle foreground tint. */
  pillClassName?: string;
  /** Horizontal inset of the pill relative to each row (px). Default 20. */
  inset?: number;
}

const variants: Variants = {
  initial: { opacity: 0, filter: "blur(6px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: (isActive: boolean) =>
    !isActive ? { opacity: 0, filter: "blur(6px)" } : {},
};

const reducedVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: (isActive: boolean) => (!isActive ? { opacity: 0 } : {}),
};

export function SharedLayoutBg({
  children,
  className,
  pillClassName,
  inset = 20,
}: SharedLayoutBgProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uid = useId();
  const reduce = useReducedMotion();

  return (
    // layoutRoot scopes the pill's layout projection to this list, so fixed or
    // scrolled ancestors can't smear scroll offsets into its movement.
    <motion.div
      layoutRoot
      onMouseLeave={() => setActiveId(null)}
      className={cn("flex w-full flex-col", className)}
    >
      {Children.toArray(children)
        .filter(isValidElement)
        .map((child, index) => {
          const el = child as ReactElement<{ className?: string; onMouseEnter?: () => void; children?: ReactNode }>;
          const childKey = el.key ? String(el.key) : `item-${index}`;
          return cloneElement(
            el,
            {
              key: childKey,
              className: cn("relative", el.props.className),
              onMouseEnter: () => setActiveId(childKey),
            },
            <>
              <AnimatePresence custom={activeId !== null}>
                {activeId !== null ? (
                  <motion.div
                    variants={reduce ? reducedVariants : variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={activeId !== null}
                    className="pointer-events-none absolute inset-y-0"
                    style={{ left: -inset, right: -inset }}
                  >
                    {activeId === childKey ? (
                      <motion.div
                        layoutId={`shared-bg-${uid}`}
                        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                        className={cn(
                          "pointer-events-none h-full w-full rounded-2xl bg-primary/[0.06]",
                          pillClassName,
                        )}
                      />
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="relative z-10">{el.props.children}</div>
            </>
          );
        })}
    </motion.div>
  );
}
