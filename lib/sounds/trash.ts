import { defineSound } from "./engine";

/** A hollow wooden-metallic drop with a short textured rustle, for discarding an item. */
export const trashSound = defineSound({
  name: "Trash",
  duration: 0.18,
  room: 0.15,
  build: (v) => {
    v.click({ freq: 1800, q: 1, decay: 0.006, gain: 0.35 });
    v.noise({ filter: "bandpass", freq: 1200, to: 400, decay: 0.08, gain: 0.4 });
    v.strike({ freq: 320, material: "wood", bend: 1.3, decay: 0.09, gain: 0.6 });
    v.strike({ freq: 140, material: "metal", at: 0.03, decay: 0.06, gain: 0.3 });
  },
});
