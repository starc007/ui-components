import { defineSound } from "./engine";

/** A bright crystalline sparkle chime, for starring repositories and bookmarks. */
export const starSound = defineSound({
  name: "Star",
  duration: 0.4,
  room: 0.28,
  build: (v) => {
    v.click({ freq: 5200, q: 2, decay: 0.003, gain: 0.25 });
    v.strike({ freq: 1760, material: "bell", decay: 0.35, gain: 0.5 });
    v.strike({ freq: 2637, material: "bell", at: 0.03, decay: 0.32, gain: 0.4 });
    v.tone({ freq: 3520, at: 0.03, decay: 0.2, gain: 0.2 });
  },
});
