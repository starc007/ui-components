"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect } from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export interface MorphingModalProps {
  /** Which view is currently shown. `null` closes the modal. */
  viewId: string | null;
  onClose: () => void;
  children: ReactNode;
  /** "bottom" anchors to the viewport bottom (mobile-like). "center" centers vertically. */
  placement?: "bottom" | "center";
  className?: string;
}

export function MorphingModal({
  viewId,
  onClose,
  children,
  placement = "bottom",
  className,
}: MorphingModalProps) {
  const open = viewId !== null;
  const reduce = useReducedMotion();
  const enterY = reduce ? 0 : placement === "bottom" ? 40 : 20;
  const enterScale = reduce ? 1 : 0.97;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Mounted only while open. A transparent fixed element that spans the
  // viewport edges makes iOS 26 Safari sample the rendered page for its edge
  // colours on every committed frame, through a blocking call into the GPU
  // process; an always-mounted wrapper would pay that cost for the life of the
  // page, closed or not. Conditional mounting is also what the rest of the
  // library's overlays do (bottom sheet, drawer, center-morph modal).
  //
  // While open the chrome is two siblings rather than one wrapper: the backdrop
  // spans the edges and carries the scrim colour, so WebKit reads the colour
  // instead of the page, and the layer that positions the panel sits inset off
  // every edge, so it is smaller than the viewport on each measured side. Its
  // content box is unchanged — `inset-4` replaces the wrapper's `px-4`, and the
  // bottom placement's `pb-8` becomes `pb-4` on top of the 1rem inset.
  //
  // Both siblings hang off `PresenceGate`, which reads whether the subtree is
  // still present. `open` alone cannot answer that: the chrome outlives it by
  // the length of the exit, and for those frames it would keep swallowing
  // clicks meant for the page and keep its controls in the tab order. The gate
  // releases interaction in the same commit that starts the exit, and only the
  // visual exit runs on.
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <PresenceGate key="backdrop">
          {({ gate }) => (
            <motion.button
              type="button"
              aria-label="Close modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              {...gate}
              onClick={onClose}
              className="pointer-events-auto fixed inset-0 z-[80] bg-background/5 [backdrop-filter:blur(14px)_saturate(140%)] [-webkit-backdrop-filter:blur(14px)_saturate(140%)]"
            />
          )}
        </PresenceGate>
      ) : null}

      {open ? (
        <PresenceGate key="panel-layer">
          {({ isPresent, gate }) => (
            // The layer itself never takes pointer events, so it carries
            // `inert` alone rather than the gate's pointer-events value.
            <div
              inert={!isPresent}
              className={cn(
                "pointer-events-none fixed inset-4 z-[80] flex justify-center",
                placement === "bottom" ? "items-end pb-4" : "items-center",
              )}
            >
              <motion.div
                key="panel"
                layout
                initial={{ opacity: 0, y: enterY, scale: enterScale }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: enterY,
                  scale: reduce ? 1 : 0.98,
                  transition: { duration: 0.18, ease: EASE_OUT },
                }}
                transition={SPRING_PANEL}
                {...gate}
                className={cn(
                  "pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-background shadow-2xl will-change-transform",
                  className,
                )}
              >
                <motion.div layout="position" className="p-5">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={viewId}
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, filter: "blur(4px)" }
                      }
                      animate={
                        reduce
                          ? {
                              opacity: 1,
                              transition: {
                                duration: 0.18,
                                ease: EASE_OUT,
                              },
                            }
                          : {
                              opacity: 1,
                              y: 0,
                              filter: "blur(0px)",
                              transition: {
                                duration: 0.24,
                                ease: EASE_OUT,
                              },
                            }
                      }
                      exit={
                        reduce
                          ? {
                              opacity: 0,
                              transition: {
                                duration: 0.14,
                                ease: EASE_OUT,
                              },
                            }
                          : {
                              opacity: 0,
                              y: -8,
                              filter: "blur(4px)",
                              transition: {
                                duration: 0.16,
                                ease: EASE_OUT,
                              },
                            }
                      }
                    >
                      {children}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>
  );
}
