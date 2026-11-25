"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useSound } from "@/lib/sound";
import { typeSound } from "@/lib/sounds/type";
import { cn } from "@/lib/utils";

const KEYS = [
  { id: "b", label: "b" },
  { id: "e", label: "e" },
  { id: "u", label: "U" },
  { id: "i", label: "I" },
] as const;
type KeyId = (typeof KEYS)[number]["id"];

// How far a keycap sinks into its well when pressed, in px.
const TRAVEL = 9;
// Each key sounds a little higher than the one before, like a short run.
const PITCH: Record<KeyId, number> = { b: 0.92, e: 1, u: 1.06, i: 1.12 };
// The "beui" wave: time between keys, and how long each stays down, in ms.
const WAVE_STEP = 70;
const WAVE_HOLD = 90;

function isTyping(target: EventTarget | null) {
  const node = target as HTMLElement | null;
  return Boolean(node && (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName)));
}

// Colours mixed from the theme, so the keys work in light and dark.
const mix = (percent: number) => `color-mix(in oklab, var(--foreground) ${percent}%, var(--background))`;

/**
 * One keycap seen slightly from the front: a recessed well, the cap's body
 * (its front wall shows below the top), and a smaller sculpted top with the
 * legend. A press sinks the whole cap into the well.
 */
function Keycap({ label, pressed, still }: { label: string; pressed: boolean; still: boolean }) {
  return (
    <div
      style={{ backgroundColor: mix(5) }}
      className="relative aspect-[6/5] rounded-[clamp(16px,2.4vw,30px)] border border-border/70 p-[4%]"
    >
      <motion.div
        initial={false}
        animate={{ y: !still && pressed ? TRAVEL : 0 }}
        transition={SPRING_PRESS}
        className="relative h-full w-full rounded-[clamp(12px,1.9vw,24px)] border border-border"
        style={{
          backgroundImage: `linear-gradient(to bottom, ${mix(16)}, ${mix(10)})`,
        }}
      >
        <div
          className={cn(
            "absolute inset-x-[7%] top-[5%] bottom-[16%] grid place-items-center overflow-hidden rounded-[clamp(10px,1.5vw,19px)] transition-[filter] duration-150",
            "group-hover/key:brightness-110",
            pressed && "brightness-95",
          )}
          style={{
            backgroundImage: `linear-gradient(to bottom, ${mix(11)}, ${mix(6)})`,
          }}
        >
          {/* The top catches the light along its upper edge. */}
          <span className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-linear-to-r from-transparent via-foreground/25 to-transparent" />
          <span
            className={cn(
              "text-[clamp(2.25rem,9vw,7rem)] leading-none font-medium tracking-[-0.04em] text-foreground/70 transition-colors duration-150",
              pressed && "text-foreground",
            )}
          >
            {label}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * The footer's sign-off: "beUI" on 4 big mechanical keycaps. Press one and it
 * sinks onto its skirt with a keystroke, then springs back with a softer one.
 * While the footer is on screen, typing b, e, u or i presses the matching key,
 * and typing "beui" runs a wave across all 4. Reduced motion keeps the keys
 * still and marks a press by colour. Decorative, so hidden from assistive
 * technology; the sounds follow the site's sound toggle.
 */
export function FooterWordmark() {
  const t = useTranslations("Chrome.footer");
  const zone = useRef<HTMLDivElement>(null);
  const visible = useInView(zone, { amount: 0.3 });
  const still = useReducedMotion() ?? false;
  const canHover = useHoverCapable();
  const click = useSound(typeSound);
  const [down, setDown] = useState<Set<KeyId>>(() => new Set());
  const typed = useRef("");

  const press = useCallback(
    (id: KeyId) => {
      setDown((current) => (current.has(id) ? current : new Set(current).add(id)));
      click({ pitch: PITCH[id] });
    },
    [click],
  );
  const release = useCallback(
    (id: KeyId) => {
      setDown((current) => {
        if (!current.has(id)) return current;
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      // The upstroke: quieter and a touch higher than the click down.
      click({ pitch: PITCH[id] * 1.18, volume: 0.35 });
    },
    [click],
  );

  useEffect(() => {
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wave = () => {
      KEYS.forEach(({ id }, index) => {
        timers.push(setTimeout(() => press(id), 140 + index * WAVE_STEP));
        timers.push(setTimeout(() => release(id), 140 + index * WAVE_STEP + WAVE_HOLD));
      });
    };
    const keyOf = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return null;
      return KEYS.find((key) => key.id === event.key.toLowerCase())?.id ?? null;
    };
    const onDown = (event: KeyboardEvent) => {
      const id = keyOf(event);
      if (!id || event.repeat) return;
      press(id);
      typed.current = (typed.current + id).slice(-4);
      if (typed.current === "beui") {
        typed.current = "";
        wave();
      }
    };
    const onUp = (event: KeyboardEvent) => {
      const id = keyOf(event);
      if (id) release(id);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      for (const timer of timers) clearTimeout(timer);
    };
  }, [visible, press, release]);

  return (
    <div ref={zone} aria-hidden="true" className="mx-auto w-full max-w-6xl px-4 pb-10">
      <p className="mb-3 text-xs text-muted-foreground/70">
        {canHover ? t("keysHint") : t("keysHintTouch")}
      </p>
      <div className="grid select-none grid-cols-4 gap-[clamp(0.375rem,1.2vw,0.875rem)]">
        {KEYS.map((key) => (
          <div
            key={key.id}
            className="group/key cursor-pointer touch-manipulation"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              press(key.id);
            }}
            onPointerUp={() => release(key.id)}
            onPointerCancel={() => release(key.id)}
          >
            <Keycap label={key.label} pressed={down.has(key.id)} still={still} />
          </div>
        ))}
      </div>
    </div>
  );
}
