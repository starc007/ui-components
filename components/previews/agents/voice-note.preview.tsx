"use client";

import { useAnimationFrame, useMotionValue, useReducedMotion } from "motion/react";
import { useState } from "react";
import { VoiceNote } from "@/components/agents/voice-note";

export function VoiceNotePreview() {
  const level = useMotionValue(0);
  const reduce = useReducedMotion();
  const [note, setNote] = useState<string>();

  // Simulated syllables and pauses stand in for a real microphone level.
  useAnimationFrame((time) => {
    if (reduce) return level.set(0.3);
    const t = time / 1000;
    // Mostly speaking, with short breaths between phrases.
    const phrase = 0.55 + 0.45 * Math.sin(t * 0.9);
    const syllable = Math.max(0, Math.sin(t * 8.7 + Math.sin(t * 2.3)));
    level.set(0.1 + phrase * (0.18 + syllable ** 2 * 0.72));
  });

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3">
      <VoiceNote
        level={level}
        onRecordStart={() => setNote(undefined)}
        onDiscard={() => setNote("Recording discarded.")}
        onSend={(ms) => setNote(`Sent a ${Math.max(1, Math.round(ms / 1000))}s voice note.`)}
      />
      <p className="h-4 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
