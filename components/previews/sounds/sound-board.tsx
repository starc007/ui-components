"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SOUND_ITEMS, type SoundItem } from "./sound-list";
import { SoundPad } from "./sound-pad";

type PadState = { pulse: number; index: number };

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * Every sound as a pad. With `shortcuts`, each pad also plays from its key
 * (1 to 0, then Q to Y) while focus isn't in a text field.
 */
export function SoundBoard({
  items = SOUND_ITEMS,
  shortcuts = true,
  renderName,
  className,
}: {
  items?: SoundItem[];
  shortcuts?: boolean;
  /** Wraps each pad's name, for example in a link to the sound's page. */
  renderName?: (item: SoundItem) => ReactNode;
  className?: string;
}) {
  const counts = useRef<Record<string, number>>({});
  const [pads, setPads] = useState<Record<string, PadState>>({});

  const play = useCallback((item: SoundItem) => {
    const index = (counts.current[item.slug] ?? 0) % item.sounds.length;
    item.sounds[index].play();
    counts.current[item.slug] = index + 1;
    setPads((current) => ({
      ...current,
      [item.slug]: { pulse: (current[item.slug]?.pulse ?? 0) + 1, index },
    }));
  }, []);

  useEffect(() => {
    if (!shortcuts) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return;
      const item = items.find((entry) => entry.key === event.key.toLowerCase());
      if (item) play(item);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, play, shortcuts]);

  // Columns follow the board's own width, so it fits a page or a preview stage.
  return (
    <div className={cn("@container", className)}>
      <div className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @3xl:grid-cols-4">
        {items.map((item) => {
          const pad = pads[item.slug];
          return (
            <SoundPad
              key={item.slug}
              name={item.name}
              sound={item.sounds[pad?.index ?? 0]}
              pulse={pad?.pulse ?? 0}
              onPress={() => play(item)}
              keyHint={shortcuts ? item.key : undefined}
              nameSlot={renderName?.(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
