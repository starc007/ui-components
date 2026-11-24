import { defineSound } from "./engine";

/** Two even mid notes, for a heads-up that needs a look. */
export const warningSound = defineSound({
  name: "Warning",
  duration: 0.3,
  build: (v) => {
    for (const at of [0, 0.12]) {
      v.tone({ type: "triangle", freq: 740, at, decay: 0.09, gain: 0.5 });
      v.tone({ freq: 1480, at, decay: 0.04, gain: 0.1 });
    }
  },
});
