"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_SWAP } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface TextMorphProps {
  /** The text to show. Changing it morphs from the previous string. */
  children: string;
  /** Classes merged onto the root element. */
  className?: string;
}

type Glyph = { id: number; char: string };

type Morph = {
  text: string;
  glyphs: Glyph[];
  nextId: number;
  /** For each new glyph, the kept neighbour it travels in with. */
  enterAnchor: Map<number, number>;
  /** For each leaving glyph, the kept neighbour it rides out with. */
  leaveAnchor: Map<number, number>;
  /** Arrival order of new glyphs, left to right. */
  enterOrder: Map<number, number>;
  /** Departure order of leaving glyphs, last letter first. */
  leaveOrder: Map<number, number>;
};

// Letters arrive one at a time and spring up into place. This spring is a
// little looser than SPRING_SWAP on purpose: a small settle on each letter is
// what makes the sequence read as letters landing rather than a fade.
const SPRING_LETTER = { type: "spring", stiffness: 520, damping: 22, mass: 0.6 } as const;
const STAGGER_IN = 0.035;
// Leaving letters go faster than new ones arrive, so the exit never holds up the entry.
const STAGGER_OUT = 0.02;
const RISE = 8;
const FADE_IN = { duration: 0.16, ease: EASE_OUT } as const;
const FADE_OUT = { duration: 0.12, ease: EASE_OUT } as const;

/** Index pairs (old, new) of the longest common subsequence of two lists. */
function lcsPairs(a: string[], b: string[]): [number, number][] {
  const cols = b.length + 1;
  const table = new Uint16Array((a.length + 1) * cols);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i * cols + j] =
        a[i] === b[j]
          ? table[(i + 1) * cols + j + 1] + 1
          : Math.max(table[(i + 1) * cols + j], table[i * cols + j + 1]);
    }
  }
  const pairs: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pairs.push([i, j]);
      i++;
      j++;
    } else if (table[(i + 1) * cols + j] >= table[i * cols + j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** The nearest id in `ids` that is kept, searching one way first and then the other. */
function nearestKept(index: number, ids: number[], kept: Set<number>, forwardFirst: boolean) {
  const scan = (step: number) => {
    for (let k = index + step; k >= 0 && k < ids.length; k += step) {
      if (kept.has(ids[k])) return ids[k];
    }
    return undefined;
  };
  return forwardFirst ? (scan(1) ?? scan(-1)) : (scan(-1) ?? scan(1));
}

function firstMorph(text: string): Morph {
  const glyphs = Array.from(text, (char, id) => ({ id, char }));
  return {
    text,
    glyphs,
    nextId: glyphs.length,
    enterAnchor: new Map(),
    leaveAnchor: new Map(),
    enterOrder: new Map(),
    leaveOrder: new Map(),
  };
}

/**
 * Pairs the old glyphs with the new string by their longest common
 * subsequence: paired glyphs keep their id (and their element), the rest
 * leave or arrive, each tied to the nearest glyph that stays.
 */
function nextMorph(previous: Morph, text: string): Morph {
  const chars = Array.from(text);
  const pairs = lcsPairs(
    previous.glyphs.map((glyph) => glyph.char),
    chars,
  );
  const reuse = new Map(pairs.map(([o, n]) => [n, previous.glyphs[o].id]));
  let nextId = previous.nextId;
  const glyphs = chars.map((char, index) => ({ id: reuse.get(index) ?? nextId++, char }));

  const kept = new Set(reuse.values());
  const oldIds = previous.glyphs.map((glyph) => glyph.id);
  const newIds = glyphs.map((glyph) => glyph.id);
  const leaveAnchor = new Map<number, number>();
  oldIds.forEach((id, index) => {
    if (kept.has(id)) return;
    const anchor = nearestKept(index, oldIds, kept, true);
    if (anchor !== undefined) leaveAnchor.set(id, anchor);
  });
  const enterAnchor = new Map<number, number>();
  newIds.forEach((id, index) => {
    if (kept.has(id)) return;
    const anchor = nearestKept(index, newIds, kept, false);
    if (anchor !== undefined) enterAnchor.set(id, anchor);
  });
  const enterOrder = new Map(newIds.filter((id) => !kept.has(id)).map((id, order) => [id, order]));
  const leaveOrder = new Map(
    oldIds
      .filter((id) => !kept.has(id))
      .reverse()
      .map((id, order) => [id, order]),
  );
  return { text, glyphs, nextId, enterAnchor, leaveAnchor, enterOrder, leaveOrder };
}

/** The x a glyph is drawn at right now, mid-slide included. */
function drawnX(el: HTMLElement) {
  const transform = getComputedStyle(el).transform;
  return transform && transform !== "none" ? new DOMMatrixReadOnly(transform).m41 : 0;
}

/**
 * Morphs one string into another. Letters the two strings share (paired by
 * their longest common subsequence) glide on a spring from where they are
 * drawn to their new place. Letters that leave ride along with their nearest
 * neighbour that stays while they shrink and fade; new letters grow in from
 * where theirs came from; the box springs to the new width. A change mid-morph
 * retargets every spring from where it is.
 */
export function TextMorph({ children: text, className }: TextMorphProps) {
  const reduce = Boolean(useReducedMotion());
  const [morph, setMorph] = useState(() => firstMorph(text));
  // Derive the next morph during render, so the new glyphs and their ids
  // land in the same commit as the text.
  let current = morph;
  if (morph.text !== text) {
    current = nextMorph(morph, text);
    setMorph(current);
  }

  const rootRef = useRef<HTMLSpanElement>(null);
  const nodes = useRef(new Map<number, HTMLSpanElement>());
  // Each glyph's layout x inside the root from the last commit, transforms excluded.
  const layout = useRef(new Map<number, number>());
  const [width, setWidth] = useState<number>();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const origin = root.getBoundingClientRect().left;
    const next = new Map<number, number>();
    for (const glyph of current.glyphs) {
      const el = nodes.current.get(glyph.id);
      if (el) next.set(glyph.id, el.getBoundingClientRect().left - origin - drawnX(el));
    }
    const before = layout.current;
    layout.current = next;
    setWidth(root.offsetWidth);
    if (reduce || before.size === 0) return;

    const travel = (id: number) => {
      const from = before.get(id);
      const to = next.get(id);
      return from === undefined || to === undefined ? 0 : to - from;
    };

    for (const glyph of current.glyphs) {
      const el = nodes.current.get(glyph.id);
      if (!el) continue;
      if (before.has(glyph.id)) {
        // Kept: jump back to where it is drawn, then spring to the new place.
        const from = drawnX(el) - travel(glyph.id);
        if (Math.abs(from) > 0.5) animate(el, { x: [from, 0] }, SPRING_LAYOUT);
      } else {
        // New: start where its anchor came from and travel in with it.
        const anchor = current.enterAnchor.get(glyph.id);
        const from = anchor === undefined ? 0 : -travel(anchor);
        if (Math.abs(from) > 0.5) animate(el, { x: [from, 0] }, SPRING_LAYOUT);
      }
    }
    // Leaving: popLayout has pinned them where they were; ride the anchor out.
    for (const [id, anchor] of current.leaveAnchor) {
      const el = nodes.current.get(id);
      const shift = travel(anchor);
      if (el && Math.abs(shift) > 0.5) animate(el, { x: drawnX(el) + shift }, SPRING_LAYOUT);
    }
  }, [current, reduce]);

  return (
    <motion.span
      initial={false}
      animate={width === undefined ? undefined : { width }}
      transition={reduce ? { duration: 0 } : SPRING_SWAP}
      className={cn("inline-block whitespace-pre", className)}
    >
      <span className="sr-only">{text}</span>
      <span ref={rootRef} aria-hidden="true" className="relative inline-flex whitespace-pre">
        {/* `custom` hands the latest morph to leaving letters too, so each
            one knows its place in the departure order. */}
        <AnimatePresence initial={false} mode="popLayout" custom={current}>
          {current.glyphs.map((glyph) => (
            <motion.span
              key={glyph.id}
              ref={(node: HTMLSpanElement | null) => {
                if (node) nodes.current.set(glyph.id, node);
                else nodes.current.delete(glyph.id);
              }}
              className="inline-block"
              custom={current}
              variants={{
                // Each new letter springs up from just below, on its own beat.
                enter: { opacity: 0, y: reduce ? 0 : RISE },
                shown: (morph: Morph) => {
                  const delay = reduce ? 0 : (morph.enterOrder.get(glyph.id) ?? 0) * STAGGER_IN;
                  return {
                    opacity: 1,
                    y: 0,
                    transition: { y: { ...SPRING_LETTER, delay }, opacity: { ...FADE_IN, delay } },
                  };
                },
                // Leaving letters drop back down the way new ones rise, last letter first.
                gone: (morph: Morph) => {
                  const delay = reduce ? 0 : (morph.leaveOrder.get(glyph.id) ?? 0) * STAGGER_OUT;
                  return {
                    opacity: 0,
                    y: reduce ? 0 : RISE,
                    transition: { y: { ...SPRING_LETTER, delay }, opacity: { ...FADE_OUT, delay } },
                  };
                },
              }}
              initial="enter"
              animate="shown"
              exit="gone"
            >
              {glyph.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </motion.span>
  );
}
