import { defineSound } from "./engine";

/** A springy upward swirl with a soft release chime, for pull-to-refresh and feed updates. */
export const refreshSound = defineSound({
  name: "Refresh",
  duration: 0.28,
  room: 0.2,
  build: (v) => {
    v.tone({ freq: 440, to: 880, attack: 0.005, decay: 0.08, gain: 0.35 });
    v.click({ freq: 3600, q: 1.5, at: 0.09, decay: 0.003, gain: 0.2 });
    v.strike({ freq: 1318.5, material: "bell", at: 0.09, decay: 0.18, gain: 0.45 });
  },
});
