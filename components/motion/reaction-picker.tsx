"use client";

import { Flame, Heart, Laugh, PartyPopper, SmilePlus, ThumbsUp } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { PresenceGate } from "@/lib/presence-gate";
import { useSound } from "@/lib/sound";
import { closeSound } from "@/lib/sounds/close";
import { openSound } from "@/lib/sounds/open";
import { selectSound } from "@/lib/sounds/select";
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
  /** Unique key, used as the picker's value. */
  id: string;
  /** Name shown above the reaction on hover and used as its accessible name. */
  label: string;
  /** Icon or emoji in the tray, which flies to the trigger once picked. */
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
  /** The initial reaction id when uncontrolled. Default: null */
  defaultValue?: string | null;
  /** Called with the picked reaction id, or null when the same one is picked again. */
  onValueChange?: (value: string | null) => void;
  /** Reactions from everyone else. The viewer's own is added on top. */
  count?: number;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<ReactionPickerMessages>;
  /** Play open and close swishes for the tray and a select on a pick. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /** Classes merged onto the root element. */
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
// The flight: across evenly, up slowing into the peak and down speeding out
// of it, so it traces one smooth arc instead of stalling at the top.
const FLIGHT_SECONDS = 0.46;
const LIFT_SCALE = 1.25;
// It lands a touch large and the button's icon settles from there.
const LAND_SCALE = 1.15;
// The tray morphs out of the button: a pill clip that springs open from a
// circle the tray's height over the icon. Near critical, so it never snaps
// past open.
const SPRING_REVEAL = { type: "spring", stiffness: 340, damping: 32, mass: 0.8 } as const;
const TRAY_HEIGHT = 46;
// The hover blob glides between reactions, stretching with its speed.
const SPRING_BLOB = { stiffness: 520, damping: 34, mass: 0.6 } as const;
// One reaction slot: a 36px button plus the 2px gap.
const SLOT = 38;
// The catch: the icon lands squashed and wobbles back to shape.
const SPRING_JELLY = { type: "spring", stiffness: 620, damping: 14, mass: 0.6 } as const;
const SQUASH = { scaleX: 1.3, scaleY: 0.78 } as const;

// Sparks from the button when it catches a reaction, alternating near and far.
const SPARKS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  const far = index % 2 === 0;
  return { id: index, x: Math.cos(angle) * (far ? 18 : 13), y: Math.sin(angle) * (far ? 18 : 13), far };
});

type Point = { x: number; y: number };
/** A reaction in the air, and what the button showed before it was picked. */
type Flight = { id: number; reaction: Reaction; previous: Reaction | null; from: Point; to: Point; scale: number };

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
  sound = false,
  className,
}: ReactionPickerProps) {
  const t = useMessages("ReactionPicker", reactionPickerMessages, labels);
  const playOpen = useSound(openSound, { enabled: sound });
  const playClose = useSound(closeSound, { enabled: sound });
  const playPick = useSound(selectSound, { enabled: sound });
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
  const optionIconRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // The tray's reveal: 1 is a circle over the icon, 0 is fully open. It
  // springs open on open and morphs back into the circle as the tray leaves,
  // so it is already closed when the next tray mounts and never flashes open
  // for a frame (motion writes a reset value only on its next frame).
  const reveal = useMotionValue(reduce ? 0 : 1);
  const trayClip = useMotionTemplate`inset(0 calc((100% - ${TRAY_HEIGHT}px) * ${reveal}) 0 0 round 999px)`;
  useEffect(() => {
    if (reduce) {
      reveal.jump(0);
      return;
    }
    const controls = open ? animate(reveal, 0, SPRING_REVEAL) : animate(reveal, 1, OUT);
    return () => controls.stop();
  }, [open, reduce, reveal]);

  // The hover blob: springs between slots and stretches with its speed.
  const blobX = useSpring(0, SPRING_BLOB);
  const blobSpeed = useVelocity(blobX);
  const blobScaleX = useTransform(blobSpeed, (speed) => 1 + Math.min(Math.abs(speed) / 2200, 0.45));
  const blobScaleY = useTransform(blobScaleX, (stretch) => 1 - (stretch - 1) * 0.35);
  const activeIndex = reactions.findIndex((reaction) => reaction.id === active);
  // Move the blob with the hover: it appears in place, then glides.
  const hover = (id: string) => {
    const index = reactions.findIndex((reaction) => reaction.id === id);
    if (active === null || reduce) blobX.jump(index * SLOT);
    else blobX.set(index * SLOT);
    setActive(id);
  };

  // Close and hand focus back to the button when it was inside the tray.
  const close = () => {
    if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    setOpen(false);
    setActive(null);
  };
  // Closing without a pick; a pick closes quietly behind its own sound.
  const dismiss = () => {
    playClose();
    close();
  };
  useDismiss(open, dismiss, rootRef);

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
    playPick({ pitch: next ? 1.1 : 0.85 });
    // Measure both ends now, from the event, while the tray is still open:
    // the icon itself, so a lifted one leaves from where it is drawn.
    const root = rootRef.current?.getBoundingClientRect();
    const source = optionIconRefs.current[index];
    const from = root && centre(source, root);
    const to = root && centre(iconRef.current, root);
    if (next && from && to && !reduce) {
      const scale = active === reaction.id ? LIFT_SCALE : 1;
      setFlight({ id: Date.now(), reaction, previous: chosen, from, to, scale });
      // The flying copy takes over from here; hide the original so it does
      // not shrink away inside the closing tray beside it.
      if (source) source.style.visibility = "hidden";
    } else if (next) setCatches((value) => value + 1);
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
        onClick={() => {
          if (open) return dismiss();
          playOpen();
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowUp") focusOnOpen.current = true;
          if (event.key === "ArrowUp" && !open) {
            event.preventDefault();
            playOpen();
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
              // A caught reaction takes over from the flying copy at its size
              // and settles; the smiley comes back from above.
              initial={
                reduce
                  ? { opacity: 0 }
                  : shown
                    ? { opacity: 1, scaleX: LAND_SCALE * SQUASH.scaleX, scaleY: LAND_SCALE * SQUASH.scaleY, y: 0 }
                    : { opacity: 0, scaleX: 0.5, scaleY: 0.5, y: -6 }
              }
              animate={{ opacity: 1, scaleX: 1, scaleY: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0, transition: OUT }
                  : { opacity: 0, y: 6, scaleX: 0.8, scaleY: 0.8, transition: OUT }
              }
              // A caught reaction wobbles back from the squash; the smiley just settles.
              transition={shown ? SPRING_JELLY : SPRING_PRESS}
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
                // Rises out of the button's icon and sinks back into it: 20px in
                // (padding plus half the icon), 26px below the tray (gap plus half the button).
                style={{ transformOrigin: "20px calc(100% + 26px)", clipPath: trayClip, ...gate.style }}
                inert={gate.inert}
                className="absolute bottom-full left-0 z-20 mb-2 flex items-center gap-0.5 rounded-full border border-border bg-background p-1"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={reduce ? { opacity: 0, transition: OUT } : { opacity: 0, scale: 0.85, y: 6, transition: OUT }}
                transition={{ ...SPRING_PANEL, opacity: { duration: 0.12, ease: EASE_OUT } }}
              >
                {/* The hover blob, gliding under whichever reaction is lifted. */}
                <motion.span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1 left-1 size-9 rounded-full bg-muted"
                  style={{ x: blobX, scaleX: blobScaleX, scaleY: blobScaleY }}
                  initial={false}
                  animate={{ opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.14, ease: EASE_OUT }}
                />
                {reactions.map((reaction, index) => {
                  const lifted = active === reaction.id && !reduce;
                  // The reactions either side lean in a little, like a dock.
                  const near = !reduce && activeIndex !== -1 && Math.abs(index - activeIndex) === 1;
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
                      onPointerEnter={() => canHover && hover(reaction.id)}
                      onFocus={() => hover(reaction.id)}
                      onBlur={() => setActive((current) => (current === reaction.id ? null : current))}
                      className={cn(
                        "relative inline-flex size-9 items-center justify-center rounded-full transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        reaction.color,
                        reaction.id === value && "bg-muted",
                      )}
                      initial={{ opacity: 0, y: reduce ? 0 : RISE }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        opacity: { duration: 0.12, ease: EASE_OUT, delay: reduce ? 0 : index * STAGGER },
                        y: { ...SPRING_RISE, delay: reduce ? 0 : index * STAGGER },
                      }}
                    >
                      {/* Only the icon lifts and grows, so the name chip stays crisp. */}
                      <motion.span
                        ref={(node) => {
                          optionIconRefs.current[index] = node;
                        }}
                        className="inline-flex"
                        initial={false}
                        animate={{ y: lifted ? -6 : near ? -2 : 0, scale: lifted ? LIFT_SCALE : near ? 1.08 : 1 }}
                        transition={SPRING_HOVER}
                      >
                        {reaction.icon}
                      </motion.span>
                      {/* The name rides above the lifted reaction. */}
                      <AnimatePresence>
                        {lifted ? (
                          <motion.span
                            aria-hidden="true"
                            className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-foreground"
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
          initial={{ x: flight.from.x, y: flight.from.y, scale: flight.scale }}
          animate={{
            x: flight.to.x,
            y: [flight.from.y, Math.min(flight.from.y, flight.to.y) - 18, flight.to.y],
            scale: [flight.scale, 1.4, LAND_SCALE],
            // It tips back on the way up and levels out to land.
            rotate: [0, -12, 0],
          }}
          transition={{
            x: { duration: FLIGHT_SECONDS, ease: EASE_IN_OUT },
            y: { duration: FLIGHT_SECONDS, ease: [EASE_OUT, EASE_IN], times: [0, 0.4, 1] },
            scale: { duration: FLIGHT_SECONDS, ease: [EASE_OUT, EASE_IN], times: [0, 0.4, 1] },
            rotate: { duration: FLIGHT_SECONDS, ease: [EASE_OUT, EASE_IN_OUT], times: [0, 0.4, 1] },
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
