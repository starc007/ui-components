import { defineSound } from "./engine";

/** The open swish falling and a little quicker, for things closing. */
export const closeSound = defineSound({
  name: "Close",
  duration: 0.16,
  build: (v) => {
    v.noise({ freq: 2400, to: 700, q: 2, attack: 0.01, decay: 0.11, gain: 0.7 });
    v.tone({ freq: 700, to: 480, decay: 0.09, gain: 0.2 });
  },
});
