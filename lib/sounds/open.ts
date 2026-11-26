import { defineSound } from "./engine";

/** A soft rising whoosh that lands with a light glass touch, for menus, popovers and dialogs opening. */
export const openSound = defineSound({
  name: "Open",
  duration: 0.2,
  room: 0.2,
  build: (v) => {
    v.noise({ freq: 600, to: 2600, q: 1.2, attack: 0.035, decay: 0.11, gain: 0.75 });
    v.noise({ freq: 4500, to: 6000, q: 1, attack: 0.03, decay: 0.07, gain: 0.05 });
    v.strike({ freq: 1320, material: "glass", at: 0.05, decay: 0.07, gain: 0.12 });
  },
});
