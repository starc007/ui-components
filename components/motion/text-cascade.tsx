"use client";

import { ActionSwapText } from "./action-swap";

export interface TextCascadeProps {
  /** Current text. Changing it cascades the letters to the new value. */
  text: string;
  className?: string;
}

/**
 * Letter-by-letter slot roll for standalone text — the old letters drop away
 * as the new ones land, left to right. Same motion as the action-swap
 * cascade variant, with a text-first API.
 */
export function TextCascade({ text, className }: TextCascadeProps) {
  return (
    <ActionSwapText value={text} animation="cascade" className={className}>
      {text}
    </ActionSwapText>
  );
}
