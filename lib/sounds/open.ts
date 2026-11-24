import { defineSound } from "./engine";

/** A short rising swish, for menus, popovers and dialogs opening. */
export const openSound = defineSound({
  name: "Open",
  duration: 0.2,
  build: (v) => {
    v.noise({ freq: 700, to: 2600, q: 2, attack: 0.02, decay: 0.14, gain: 0.8 });
    v.tone({ freq: 520, to: 780, attack: 0.01, decay: 0.12, gain: 0.2 });
  },
});
