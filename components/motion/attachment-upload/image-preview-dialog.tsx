"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";
import { PresenceGate } from "@/lib/presence-gate";
import { useScrollLock } from "@/lib/scroll-lock";
import type { Translate } from "./messages";
import type { AttachmentUploadItem } from "./types";
import { ITEM_TRANSITION, imageSource } from "./utils";

export function ImagePreviewDialog({
  item,
  layoutId,
  onClose,
  reduce,
  t,
}: {
  item: AttachmentUploadItem | null;
  layoutId?: string;
  onClose: () => void;
  reduce: boolean;
  t: Translate;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // The close button is the only stop, so Tab stays on it; Escape closes and
  // focus returns to the thumbnail that opened the preview.
  useFocusTrap(Boolean(item), panelRef, { onEscape: onClose });
  useScrollLock(Boolean(item));

  if (typeof document === "undefined") return null;

  const src = item ? imageSource(item) : undefined;
  const content =
    item && src ? (
      // The wrapper carries no box: both children are `fixed` and resolve
      // against the viewport themselves. The scrim spans the viewport edges but
      // paints a colour, and the layer that centres the image is inset off every
      // edge. `PresenceGate` releases interaction in the same commit that starts
      // the exit.
      <PresenceGate>
        {({ isPresent, gate }) => (
          <div
            inert={!isPresent}
            className="pointer-events-none fixed left-0 top-0 z-[10000] size-0"
          >
            <motion.button
              type="button"
              aria-label={t("closePreview")}
              tabIndex={-1}
              className="pointer-events-auto fixed inset-0 size-full cursor-default bg-black/45 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: reduce ? 0.1 : 0.2, ease: EASE_OUT }}
              {...gate}
              onClick={onClose}
            />

            <div className="fixed inset-4 flex items-center justify-center sm:inset-8">
              <motion.div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-label={t("previewOf", { name: item.name })}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={ITEM_TRANSITION}
                {...gate}
                className="pointer-events-auto relative"
              >
                <motion.img
                  layoutId={reduce ? undefined : layoutId}
                  src={src}
                  alt={item.name}
                  className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                  transition={{ layout: SPRING_LAYOUT }}
                />
                <motion.button
                  type="button"
                  aria-label={t("closePreview")}
                  onClick={onClose}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={
                    reduce ? undefined : { opacity: 0, scale: 0.8 }
                  }
                  whileTap={reduce ? undefined : { scale: 0.92 }}
                  transition={SPRING_PRESS}
                  className="absolute -right-3 -top-3 grid size-9 place-items-center rounded-full bg-background text-foreground shadow-xl outline-none ring-1 ring-border/70 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </PresenceGate>
    ) : null;

  return createPortal(
    reduce ? content : <AnimatePresence>{content}</AnimatePresence>,
    document.body,
  );
}
