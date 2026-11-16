"use client";

import { Bookmark } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ComponentPropsWithRef, useState } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const bookmarkButtonMessages = {
  save: "Save",
};

export type BookmarkButtonMessages = typeof bookmarkButtonMessages;

export interface BookmarkButtonProps
  extends Omit<ComponentPropsWithRef<"button">, "children" | "onChange"> {
  saved?: boolean;
  defaultSaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  labels?: Partial<BookmarkButtonMessages>;
}

const FILL_TRANSITION = { duration: 0.28, ease: EASE_OUT } as const;
const DRAIN_TRANSITION = { duration: 0.18, ease: EASE_OUT } as const;

/** A bookmark toggle whose fill rises from the bottom as the icon dips in. */
export function BookmarkButton({
  saved: savedProp,
  defaultSaved = false,
  onSavedChange,
  labels,
  className,
  onClick,
  ...rest
}: BookmarkButtonProps) {
  const t = useMessages("BookmarkButton", bookmarkButtonMessages, labels);
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(defaultSaved);
  const saved = savedProp ?? internal;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t("save")}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !saved;
        if (savedProp === undefined) setInternal(next);
        onSavedChange?.(next);
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full transition-colors",
        "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        saved && "text-primary hover:text-primary",
        className,
      )}
      {...rest}
    >
      <motion.span
        aria-hidden="true"
        className="relative inline-flex"
        // The ribbon drops into place as it fills. No remount, so the fill
        // below animates from where it was.
        initial={false}
        animate={{ y: saved && !reduce ? [-3, 0] : 0 }}
        transition={SPRING_PRESS}
      >
        <Bookmark className="size-4" />
        <motion.span
          className="absolute inset-0 inline-flex"
          initial={false}
          animate={{ clipPath: saved ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)" }}
          transition={reduce ? { duration: 0 } : saved ? FILL_TRANSITION : DRAIN_TRANSITION}
        >
          <Bookmark className="size-4 fill-current" />
        </motion.span>
      </motion.span>
    </button>
  );
}
