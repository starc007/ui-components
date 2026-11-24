import { defineSound } from "./engine";

/** Two low notes falling with a slight buzz, for a failed action. */
export const errorSound = defineSound({
  name: "Error",
  duration: 0.35,
  build: (v) => {
    v.tone({ type: "triangle", freq: 330, decay: 0.12, gain: 0.55 });
    v.tone({ type: "square", freq: 165, decay: 0.1, gain: 0.05 });
    v.tone({ type: "triangle", freq: 262, at: 0.1, decay: 0.2, gain: 0.55 });
    v.tone({ type: "square", freq: 131, at: 0.1, decay: 0.18, gain: 0.05 });
  },
});
