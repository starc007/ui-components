"use client";

import { Check, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { deleteSound } from "@/lib/sounds/delete";
import { tapSound } from "@/lib/sounds/tap";
import { cn } from "@/lib/utils";

export const deleteButtonMessages = {
  delete: "Delete",
  confirm: "Confirm delete",
  cancel: "Cancel",
  deleting: "Deleting",
  deleted: "Deleted",
};

export type DeleteButtonMessages = typeof deleteButtonMessages;

type Phase = "idle" | "confirm" | "deleting" | "deleted";

export interface DeleteButtonProps {
  /**
   * Runs when the delete is confirmed. Return a promise to keep the spinner
   * up until it settles; if it rejects, the button goes back to the bin.
   */
  onDelete?: () => unknown;
  disabled?: boolean;
  labels?: Partial<DeleteButtonMessages>;
  /** Play a tap to arm, a close on cancel and a crumple once deleted. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  className?: string;
}

// Without a promise, the spinner still shows long enough to read.
const DELETING_MS = 900;
// Deleted holds before the bin comes back.
const DELETED_MS = 1500;

const EXIT = { duration: 0.12, ease: EASE_OUT } as const;
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
const DRAW = { duration: 0.3, ease: EASE_OUT, delay: 0.08 } as const;
// One turn per 0.8s, evenly: a spinner should never ease.
const SPIN = { duration: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;
// The pair opens out from the centre, where the bin was.
const SPREAD = 10;

/**
 * A delete that asks first. The bin opens into a cross and a tick; the
 * tick turns it into a spinner while the delete runs, then a drawn check
 * with Deleted, before the bin comes back. The cross, Escape or moving
 * focus away cancels. One pill springs to fit each step.
 */
export function DeleteButton({
  onDelete,
  disabled = false,
  labels,
  sound = false,
  className,
}: DeleteButtonProps) {
  const t = useMessages("DeleteButton", deleteButtonMessages, labels);
  const playArm = useSound(tapSound, { enabled: sound });
  const playCancel = useSound(closeSound, { enabled: sound });
  const playDeleted = useSound(deleteSound, { enabled: sound });
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");

  // The pill springs to the width of the step on show, measured from it.
  const faceRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const next = faceRef.current?.offsetWidth;
    if (next) setWidth((current) => (current === next ? current : next));
  });

  // Focus follows the step a press swapped in, so keyboard users never lose
  // their place: the cross (the safe choice) when asked, the bin after.
  const moveFocus = useRef(false);
  const binRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!moveFocus.current) return;
    if (phase === "confirm") cancelRef.current?.focus();
    if (phase === "idle") binRef.current?.focus();
    if (phase === "confirm" || phase === "idle") moveFocus.current = false;
  }, [phase]);

  // Deleted holds a beat, then the bin comes back.
  useEffect(() => {
    if (phase !== "deleted") return;
    const id = setTimeout(() => setPhase("idle"), DELETED_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const pillRef = useRef<HTMLDivElement>(null);
  const go = (next: Phase) => {
    // Only carry focus along when it is already in the pill, so a click from
    // code (an autoplaying demo, say) never pulls focus across the page.
    moveFocus.current = Boolean(pillRef.current?.contains(document.activeElement));
    setPhase(next);
  };

  const confirm = async () => {
    // Keep focus in the pill while the spinner and check show.
    if (pillRef.current?.contains(document.activeElement)) pillRef.current.focus();
    setPhase("deleting");
    const started = Date.now();
    try {
      await onDelete?.();
    } catch {
      go("idle");
      return;
    }
    const wait = Math.max(0, DELETING_MS - (Date.now() - started));
    setTimeout(() => {
      playDeleted();
      setPhase("deleted");
    }, wait);
  };

  const blur = reduce ? "blur(0px)" : "blur(3px)";
  const face = {
    initial: { opacity: 0, scale: reduce ? 1 : 0.8, filter: blur },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: reduce ? 1 : 0.8, filter: blur, transition: EXIT },
    transition: { ...SPRING_SWAP, opacity: FADE_IN },
  };
  const side = (offset: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : offset, scale: reduce ? 1 : 0.6 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: reduce ? 0 : offset, scale: reduce ? 1 : 0.6, transition: EXIT },
    transition: { ...SPRING_SWAP, opacity: FADE_IN },
  });
  const round = cn(
    "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  );
  const setFace = (node: HTMLElement | null) => {
    if (node) faceRef.current = node;
  };

  return (
    <motion.div
      ref={pillRef}
      // Focus can rest on the pill itself while the spinner shows.
      tabIndex={-1}
      initial={false}
      animate={width ? { width } : undefined}
      transition={reduce ? { duration: 0 } : SPRING_SWAP}
      onKeyDown={(event) => {
        if (event.key === "Escape" && phase === "confirm") {
          playCancel();
          go("idle");
        }
      }}
      onBlur={(event) => {
        // Cancel when focus leaves the pill while it is asking.
        if (phase === "confirm" && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPhase("idle");
        }
      }}
      className={cn(
        "relative inline-flex h-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-medium outline-none",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {phase === "idle" ? (
          <motion.button
            key="idle"
            ref={(node) => {
              binRef.current = node;
              setFace(node);
            }}
            type="button"
            disabled={disabled}
            aria-label={t("delete")}
            onClick={() => {
              playArm();
              go("confirm");
            }}
            whileTap={reduce ? undefined : { scale: 0.9 }}
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
              "hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50",
            )}
            {...face}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </motion.button>
        ) : phase === "confirm" ? (
          <motion.div
            key="confirm"
            ref={setFace}
            // Pressing either button keeps focus where it is, so the blur
            // that cancels never fires between the press and the click.
            onPointerDown={(event) => event.preventDefault()}
            className="flex shrink-0 items-center gap-1 px-1"
          >
            <motion.button
              ref={cancelRef}
              type="button"
              aria-label={t("cancel")}
              onClick={() => {
                playCancel();
                go("idle");
              }}
              className={cn(round, "text-muted-foreground hover:bg-muted hover:text-foreground")}
              {...side(SPREAD)}
            >
              <X aria-hidden="true" className="size-4" />
            </motion.button>
            <motion.button
              type="button"
              aria-label={t("confirm")}
              onClick={() => void confirm()}
              className={cn(round, "bg-destructive text-white hover:bg-destructive/90")}
              {...side(-SPREAD)}
            >
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        ) : phase === "deleting" ? (
          <motion.span
            key="deleting"
            ref={setFace}
            role="status"
            aria-label={t("deleting")}
            className="inline-flex size-9 shrink-0 items-center justify-center text-destructive"
            {...face}
          >
            <motion.svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              aria-hidden="true"
              className="size-4"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={SPIN}
            >
              <circle cx="12" cy="12" r="8" className="opacity-25" />
              <path d="M12 4a8 8 0 0 1 8 8" />
            </motion.svg>
          </motion.span>
        ) : (
          <motion.span
            key="deleted"
            ref={setFace}
            role="status"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 pr-3.5 pl-3 whitespace-nowrap text-muted-foreground"
            {...face}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-4 text-foreground"
            >
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? { duration: 0 } : DRAW}
              />
            </svg>
            {t("deleted")}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
