import { defineSound } from "./engine";

/** A short crumple that drops away, for removing or trashing an item. */
export const deleteSound = defineSound({
  name: "Delete",
  duration: 0.2,
  build: (v) => {
    v.noise({ filter: "lowpass", freq: 3000, to: 300, q: 0.7, attack: 0.005, decay: 0.16, gain: 0.7 });
    v.tone({ freq: 260, to: 110, decay: 0.12, gain: 0.35 });
  },
});
