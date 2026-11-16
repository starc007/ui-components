"use client";

import { Flame, Heart, Laugh, PartyPopper, SmilePlus, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { PresenceGate } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export const reactionPickerMessages = {
  react: "Add reaction",
  reacted: "Reacted with {reaction}",
  reactions: "Reactions",
  like: "Like",
  love: "Love",
  haha: "Haha",
  fire: "Fire",
  party: "Party",
};

export type ReactionPickerMessages = typeof reactionPickerMessages;

export type Reaction = {
  id: string;
  label: string;
  icon: ReactNode;
  /** Text colour class for the icon, e.g. "text-rose-500". */
  color?: string;
  /** Classes for the button once this reaction is picked. */
  tint?: string;
};

export interface ReactionPickerProps {
  /** The choices, in order. Defaults to like, love, haha, fire and party. */
  reactions?: Reaction[];
  /** The viewer's reaction id, or null for none. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Reactions from everyone else. The viewer's own is added on top. */
  count?: number;
  labels?: Partial<ReactionPickerMessages>;
  className?: string;
}

// Each reaction rises into the tray a beat after the one before it.
const STAGGER = 0.035;
const RISE = 12;
// Looser than SPRING_SWAP on purpose: each icon lands with a small settle.
const SPRING_RISE = { type: "spring", stiffness: 520, damping: 22, mass: 0.6 } as const;
// The hovered reaction lifts and grows quickly, and settles back as quickly.
const SPRING_HOVER = { type: "spring", stiffness: 600, damping: 26, mass: 0.5 } as const;
const OUT = { duration: 0.14, ease: EASE_OUT } as const;
// The flight: across on an ease-out, up then down on its own curve, so it arcs.
const FLIGHT_SECONDS = 0.5;

// Sparks from the button when it catches a reaction, alternating near and far.
const SPARKS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  const far = index % 2 === 0;
  return { id: index, x: Math.cos(angle) * (far ? 18 : 13), y: Math.sin(angle) * (far ? 18 : 13), far };
});

type Point = { x: number; y: number };
/** A reaction in the air, and what the button showed before it was picked. */
type Flight = { id: number; reaction: Reaction; previous: Reaction | null; from: Point; to: Point };

/** The centre of an element, relative to an origin rect. */
function centre(el: Element | null | undefined, origin: DOMRect): Point | null {
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2 - origin.left, y: rect.top + rect.height / 2 - origin.top };
}

/**
 * A reaction button. Pressing it grows a tray out of the button with each
 * reaction rising in turn; hovering one lifts it and shows its name. The one
 * you pick arcs down onto the button, which catches it with a pop and a burst
 * in the reaction's colour as the count rolls. Picking it again takes it back.
 */
export function ReactionPicker({
  reactions: reactionsProp,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  count = 0,
  labels,
  className,
}: ReactionPickerProps) {
  const t = useMessages("ReactionPicker", reactionPickerMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const canHover = useHoverCapable();
  const [internal, setInternal] = useState<string | null>(defaultValue);
  const value = valueProp === undefined ? internal : valueProp;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  // Counts catches, so each landing replays the pop and the sparks.
  const [catches, setCatches] = useState(0);

  const reactions: Reaction[] = reactionsProp ?? [
    {
      id: "like",
      label: t("like"),
      icon: <ThumbsUp className="size-5" />,
      color: "text-sky-500",
      tint: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      id: "love",
      label: t("love"),
      icon: <Heart className="size-5" />,
      color: "text-rose-500",
      tint: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    {
      id: "haha",
      label: t("haha"),
      icon: <Laugh className="size-5" />,
      color: "text-amber-500",
      tint: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      id: "fire",
      label: t("fire"),
      icon: <Flame className="size-5" />,
      color: "text-orange-500",
      tint: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      id: "party",
      label: t("party"),
      icon: <PartyPopper className="size-5" />,
      color: "text-emerald-500",
      tint: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];
  const chosen = reactions.find((reaction) => reaction.id === value) ?? null;
  // While a reaction is in the air, the button still shows what it had, so
  // nothing changes on it until the catch.
  const shown = flight ? flight.previous : chosen;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Close and hand focus back to the button when it was inside the tray.
  const close = () => {
    if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setOpen(false);
    setActive(null);
  };
  useDismiss(open, close, rootRef);

  // Opening by keyboard moves focus to the current reaction, or the first.
  const focusOnOpen = useRef(false);
  const startIndex = Math.max(0, reactions.findIndex((reaction) => reaction.id === value));
  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    focusOnOpen.current = false;
    optionRefs.current[startIndex]?.focus();
  }, [open, startIndex]);

  const pick = (reaction: Reaction, index: number) => {
    const next = reaction.id === value ? null : reaction.id;
    // Measure both ends now, from the event, while the tray is still open.
    const root = rootRef.current?.getBoundingClientRect();
    const from = root && centre(optionRefs.current[index], root);
    const to = root && centre(iconRef.current, root);
    if (next && from && to && !reduce) setFlight({ id: Date.now(), reaction, previous: chosen, from, to });
    else if (next) setCatches((value) => value + 1);
    if (valueProp === undefined) setInternal(next);
    onValueChange?.(next);
    close();
  };

  const onTrayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step || index === -1) return;
    event.preventDefault();
    optionRefs.current[(index + step + reactions.length) % reactions.length]?.focus();
  };

  const total = count + (value ? 1 : 0);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <motion.button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={chosen ? t("reacted", { reaction: chosen.label }) : t("react")}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowUp") focusOnOpen.current = true;
          if (event.key === "ArrowUp" && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          "relative inline-flex h-9 items-center gap-1.5 rounded-full border pr-3.5 pl-2.5 text-sm font-medium tabular-nums transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          shown?.tint ?? "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <span ref={iconRef} aria-hidden="true" className="relative inline-flex size-5 items-center justify-center">
          {/* The catch: sparks in the reaction's colour from where it lands. */}
          {catches > 0 && !reduce && chosen ? (
            <span key={catches} className={cn("pointer-events-none absolute inset-0", chosen.color)}>
              {SPARKS.map((spark) => (
                <motion.span
                  key={spark.id}
                  className={cn("absolute top-1/2 left-1/2 rounded-full bg-current", spark.far ? "size-1" : "size-[3px]")}
                  style={{ translate: "-50% -50%" }}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], x: spark.x, y: spark.y }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: spark.far ? 0 : 0.04 }}
                />
              ))}
            </span>
          ) : null}
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={`${shown?.id ?? "none"}-${shown ? catches : 0}`}
              className="inline-flex"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: shown ? 0 : -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: OUT } : { opacity: 0, y: 6, scale: 0.8, transition: OUT }}
              transition={SPRING_PRESS}
            >
              {shown ? shown.icon : <SmilePlus className="size-5" />}
            </motion.span>
          </AnimatePresence>
        </span>
        {total > 0 ? <DigitSwap value={total} direction={value ? "up" : "down"} /> : null}
      </motion.button>

      <AnimatePresence>
        {open ? (
          <PresenceGate>
            {({ gate }) => (
              <motion.div
                role="group"
                aria-label={t("reactions")}
                onKeyDown={onTrayKeyDown}
                onPointerLeave={() => setActive(null)}
                // Grows out of the button's icon and shrinks back into it: 20px in
                // (padding plus half the icon), 26px below the tray (gap plus half the button).
                style={{ transformOrigin: "20px calc(100% + 26px)", ...gate.style }}
                inert={gate.inert}
                className="absolute bottom-full left-0 z-20 mb-2 flex items-center gap-0.5 rounded-full border border-border bg-background p-1"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: OUT } : { opacity: 0, scale: 0.6, transition: OUT }}
                transition={{ ...SPRING_PANEL, opacity: { duration: 0.12, ease: EASE_OUT } }}
              >
                {reactions.map((reaction, index) => {
                  const lifted = active === reaction.id && !reduce;
                  return (
                    <motion.button
                      key={reaction.id}
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      type="button"
                      aria-label={reaction.label}
                      aria-pressed={reaction.id === value}
                      tabIndex={index === startIndex ? 0 : -1}
                      onClick={() => pick(reaction, index)}
                      onPointerEnter={() => canHover && setActive(reaction.id)}
                      onFocus={() => setActive(reaction.id)}
                      onBlur={() => setActive((current) => (current === reaction.id ? null : current))}
                      className={cn(
                        "relative inline-flex size-9 items-center justify-center rounded-full transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        reaction.color,
                        reaction.id === value && "bg-muted",
                      )}
                      initial={{ opacity: 0, y: reduce ? 0 : RISE }}
                      animate={{ opacity: 1, y: lifted ? -6 : 0, scale: lifted ? 1.25 : 1 }}
                      transition={{
                        opacity: { duration: 0.12, ease: EASE_OUT, delay: reduce ? 0 : index * STAGGER },
                        y: active ? SPRING_HOVER : { ...SPRING_RISE, delay: reduce ? 0 : index * STAGGER },
                        scale: SPRING_HOVER,
                      }}
                    >
                      {reaction.icon}
                      {/* The name rides above the lifted reaction. */}
                      <AnimatePresence>
                        {lifted ? (
                          <motion.span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground"
                            style={{ translate: "-50% 0" }}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 4, transition: OUT }}
                            transition={SPRING_HOVER}
                          >
                            {reaction.label}
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </PresenceGate>
        ) : null}
      </AnimatePresence>

      {/* The picked reaction in the air: across on one curve, up then down on another. */}
      {flight ? (
        <motion.span
          key={flight.id}
          aria-hidden="true"
          className={cn("pointer-events-none absolute top-0 left-0 z-30 inline-flex", flight.reaction.color)}
          style={{ translate: "-50% -50%" }}
          initial={{ x: flight.from.x, y: flight.from.y, scale: 1.25 }}
          animate={{
            x: flight.to.x,
            y: [flight.from.y, Math.min(flight.from.y, flight.to.y) - 18, flight.to.y],
            scale: [1.25, 1.4, 1],
          }}
          transition={{
            x: { duration: FLIGHT_SECONDS, ease: EASE_OUT },
            y: { duration: FLIGHT_SECONDS, ease: EASE_OUT, times: [0, 0.35, 1] },
            scale: { duration: FLIGHT_SECONDS, ease: EASE_OUT, times: [0, 0.35, 1] },
          }}
          onAnimationComplete={() => {
            setFlight(null);
            setCatches((value) => value + 1);
          }}
        >
          {flight.reaction.icon}
        </motion.span>
      ) : null}
    </div>
  );
}
