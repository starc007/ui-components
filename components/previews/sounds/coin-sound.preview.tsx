"use client";

import { coinSound } from "@/lib/sounds/coin";
import { SoundPreviewPad } from "./sound-pad";

export function CoinSoundPreview() {
  return <SoundPreviewPad name="Coin" sounds={[coinSound]} />;
}
