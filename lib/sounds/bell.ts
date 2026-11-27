import { defineSound } from "./engine";

/** A resonant brass bell chime with rich natural partials, for alarms, timers and reminders. */
export const bellSound = defineSound({
  name: "Bell",
  duration: 0.5,
  room: 0.32,
  build: (v) => {
    v.click({ freq: 3800, q: 1.4, decay: 0.003, gain: 0.18 });
    v.strike({ freq: 659.25, material: "bell", bend: 1.003, decay: 0.45, gain: 0.5 });
    v.tone({ freq: 1318.5, decay: 0.3, gain: 0.25 });
    v.tone({ freq: 1977.75, decay: 0.18, gain: 0.12 });
  },
});
