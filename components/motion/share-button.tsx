"use client";

import { Check, Link, Mail, MessageCircle, Share2, X } from "lucide-react";
import { AnimatePresence, type HTMLMotionProps, motion, useIsPresent, useReducedMotion } from "motion/react";
import { type KeyboardEvent, type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { successSound } from "@/lib/sounds/success";
import { cn } from "@/lib/utils";

export const shareButtonMessages = {
  share: "Share",
  close: "Close",
  copy: "Copy link",
  copied: "Copied",
  email: "Email",
  message: "Message",
};

export type ShareButtonMessages = typeof shareButtonMessages;

export type ShareAction = {
  /** Unique key, passed to `onAction` when the bubble is pressed. */
  id: string;
  /** Bubble name, shown beside it on hover or focus and read as its label. */
  label: string;
  /** Icon in the bubble, swapped for a check once the action is done. */
  icon: ReactNode;
  /** Shown on the label once the action is done, e.g. "Copied". */
  doneLabel?: string;
};

export interface ShareButtonProps {
  /** Replace the default copy link, email and message actions. */
  actions?: ShareAction[];
  /**
   * Called with the action's id. The button does no sharing of its own:
   * copy the link, open a composer or call your API here. Return a promise
   * to show the check once it settles; if it rejects, the fan stays open.
   */
  onAction?: (id: string) => unknown;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<ShareButtonMessages>;
  /** Play open and close swishes for the fan and a success chime when an action is done. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /** Classes merged onto the root element. */
  className?: string;
}

// The fan: actions sit on an arc above the button, from upper left to upper right.
const RADIUS = 62;
const ARC_FROM = 158;
const ARC_TO = 22;
// Each action leaves a beat after the one before; they come home faster.
const STAGGER_OUT = 0.04;
const STAGGER_IN = 0.025;
// Looser than SPRING_SWAP on purpose, so each bubble lands with a small settle.
const SPRING_FAN = { type: "spring", stiffness: 480, damping: 24, mass: 0.6 } as const;
const SPRING_HOVER = { type: "spring", stiffness: 600, damping: 26, mass: 0.5 } as const;
const HOME = { duration: 0.18, ease: EASE_OUT } as const;
const DONE_MS = 1000;

/** Where action `index` of `count` sits on the arc, from the button's centre. */
function spot(index: number, count: number) {
  const angle = count === 1 ? 90 : ARC_FROM - ((ARC_FROM - ARC_TO) * index) / (count - 1);
  const radians = (angle * Math.PI) / 180;
  return { x: Math.cos(radians) * RADIUS, y: -Math.sin(radians) * RADIUS };
}

// A name sits on the outer side of its bubble, away from the fan, so it
// never lands on a neighbour: left of the left bubbles, right of the right
// ones, above the one at the top.
const LABEL_SIDE = {
  left: { className: "top-1/2 right-full mr-2", style: { translate: "0 -50%" }, from: { x: 4, y: 0 } },
  right: { className: "top-1/2 left-full ml-2", style: { translate: "0 -50%" }, from: { x: -4, y: 0 } },
  top: { className: "bottom-full left-1/2 mb-2", style: { translate: "-50% 0" }, from: { x: 0, y: 4 } },
} as const;

function sideOf(x: number): keyof typeof LABEL_SIDE {
  if (x < -RADIUS / 3) return "left";
  if (x > RADIUS / 3) return "right";
  return "top";
}

/**
 * One action bubble. While it flies home it stops taking input at once,
 * and it accepts the ref AnimatePresence hands it.
 */
function Bubble({ ref, style, ...props }: HTMLMotionProps<"button"> & { ref?: Ref<HTMLButtonElement> }) {
  const isPresent = useIsPresent();
  return (
    <motion.button
      ref={ref}
      inert={!isPresent}
      style={{ ...style, pointerEvents: isPresent ? "auto" : "none" }}
      {...props}
    />
  );
}

/**
 * A share button that fans out. Pressing it turns the share icon into a
 * close mark and springs the actions out of it on an arc, one after another;
 * hovering one lifts it and shows its name. Choosing one turns its bubble
 * into a check, then the fan folds back into the button. What an action
 * does is up to `onAction`; the button itself shares nothing.
 */
export function ShareButton({
  actions: actionsProp,
  onAction,
  labels,
  sound = false,
  className,
}: ShareButtonProps) {
  const t = useMessages("ShareButton", shareButtonMessages, labels);
  const playOpen = useSound(openSound, { enabled: sound });
  const playClose = useSound(closeSound, { enabled: sound });
  const playDone = useSound(successSound, { enabled: sound });
  const reduce = Boolean(useReducedMotion());
  const canHover = useHoverCapable();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const actions: ShareAction[] = actionsProp ?? [
    { id: "copy", label: t("copy"), doneLabel: t("copied"), icon: <Link className="size-4" /> },
    { id: "email", label: t("email"), icon: <Mail className="size-4" /> },
    { id: "message", label: t("message"), icon: <MessageCircle className="size-4" /> },
  ];

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const actionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  // Opening by keyboard moves focus to the first action; closing returns it.
  const focusOnOpen = useRef(false);
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    actionRefs.current[0]?.focus();
  }, [open]);

  const close = () => {
    if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    clearTimeout(timer.current);
    setOpen(false);
    setActive(null);
    setDone(null);
  };
  // Closing by hand; the close after a finished action is quiet behind its chime.
  const dismiss = () => {
    playClose();
    close();
  };
  useDismiss(open, dismiss, rootRef);

  const run = async (action: ShareAction) => {
    try {
      await onAction?.(action.id);
    } catch {
      return;
    }
    playDone();
    setDone(action.id);
    setActive(action.id);
    timer.current = setTimeout(close, DONE_MS);
  };

  // Arrow keys walk the fan, wrapping at either end.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = actionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step || index === -1) return;
    event.preventDefault();
    actionRefs.current[(index + step + actions.length) % actions.length]?.focus();
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <AnimatePresence>
        {open
          ? actions.map((action, index) => {
              const { x, y } = spot(index, actions.length);
              const lifted = active === action.id;
              const finished = done === action.id;
              const side = LABEL_SIDE[sideOf(x)];
              return (
                <Bubble
                  key={action.id}
                  ref={(node) => {
                    actionRefs.current[index] = node;
                  }}
                  type="button"
                  aria-label={finished && action.doneLabel ? action.doneLabel : action.label}
                  onClick={() => void run(action)}
                  onKeyDown={onKeyDown}
                  onPointerEnter={() => canHover && setActive(action.id)}
                  onPointerLeave={() => !done && setActive(null)}
                  onFocus={() => setActive(action.id)}
                  onBlur={() => !done && setActive((current) => (current === action.id ? null : current))}
                  className={cn(
                    "absolute top-1/2 left-1/2 -mt-5 -ml-5 inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-200",
                    // The bubble you are on, and its name, sit above its neighbours.
                    lifted ? "z-30" : "z-10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    finished
                      ? "border-primary/30 bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                  initial={{ x: 0, y: 0, scale: reduce ? 1 : 0.3, opacity: 0 }}
                  // The one you are on lifts a little and grows.
                  animate={{ x, y: lifted && !reduce ? y - 3 : y, scale: lifted && !reduce ? 1.1 : 1, opacity: 1 }}
                  exit={{
                    x: reduce ? x : 0,
                    y: reduce ? y : 0,
                    scale: reduce ? 1 : 0.3,
                    opacity: 0,
                    transition: { ...HOME, delay: reduce ? 0 : (actions.length - 1 - index) * STAGGER_IN },
                  }}
                  transition={{
                    ...(active ? SPRING_HOVER : SPRING_FAN),
                    delay: active || reduce ? 0 : index * STAGGER_OUT,
                    opacity: { duration: 0.12, ease: EASE_OUT, delay: reduce ? 0 : index * STAGGER_OUT },
                  }}
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={finished ? "done" : "icon"}
                      aria-hidden="true"
                      className="inline-flex"
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.5, rotate: reduce ? 0 : -30 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: reduce ? 1 : 0.5, transition: HOME }}
                      transition={SPRING_PRESS}
                    >
                      {finished ? <Check className="size-4" strokeWidth={2.5} /> : action.icon}
                    </motion.span>
                  </AnimatePresence>
                  {/* The name, on the outer side of the bubble you are on. */}
                  <AnimatePresence>
                    {lifted ? (
                      <motion.span
                        key={finished ? "done" : "name"}
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground",
                          side.className,
                        )}
                        style={side.style}
                        initial={{ opacity: 0, ...(reduce ? {} : side.from) }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, ...(reduce ? {} : side.from), transition: HOME }}
                        transition={SPRING_HOVER}
                      >
                        {finished && action.doneLabel ? action.doneLabel : action.label}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </Bubble>
              );
            })
          : null}
      </AnimatePresence>

      <motion.button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-label={open ? t("close") : t("share")}
        whileTap={reduce ? undefined : { scale: 0.92 }}
        transition={SPRING_PRESS}
        onClick={() => {
          if (open) return dismiss();
          playOpen();
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") focusOnOpen.current = !open;
        }}
        className={cn(
          "relative z-20 inline-flex size-10 items-center justify-center rounded-full border transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          open
            ? "border-border bg-muted text-foreground"
            : "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {/* The share mark turns a quarter as it gives way to the close mark. */}
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={open ? "close" : "share"}
            aria-hidden="true"
            className="inline-flex"
            initial={{ opacity: 0, rotate: reduce ? 0 : open ? -90 : 90, scale: reduce ? 1 : 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: reduce ? 0 : open ? 90 : -90, scale: reduce ? 1 : 0.6, transition: HOME }}
            transition={SPRING_PRESS}
          >
            {open ? <X className="size-4" /> : <Share2 className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
