import type { FC } from "react";

/** A single control's current value. */
export type ControlValue = number | string | number[];

/** All control values for one playground type, keyed by control `key`. */
export type Values = Record<string, ControlValue>;

/**
 * A control rendered in the playground's left panel. Each type declares its own
 * set; the shell renders them generically and never knows what they drive.
 */
export type ControlDef =
  | {
      kind: "slider";
      key: string;
      label: string;
      /** One-line plain-English definition shown under the control. */
      hint?: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      hint?: string;
      options: { label: string; value: string }[];
    }
  | {
      kind: "numberlist";
      key: string;
      label: string;
      hint?: string;
      minItems?: number;
      maxItems?: number;
      /** Slider bounds for each value; may depend on other controls. */
      bounds?: (values: Values) => { min: number; max: number; step: number };
      /** Plain-English meaning of a single value (e.g. "150% size, bigger"). */
      describe?: (n: number, values: Values) => string;
    }
  | { kind: "curve"; key: string; label: string; hint?: string };

export interface Preset {
  name: string;
  values: Values;
}

/**
 * One decoded line of the generated code: `code` is the snippet fragment it
 * refers to (rendered monospace), `text` explains it in plain English using the
 * current values. This is the teaching layer — it turns the code into a lesson.
 */
export interface ExplainPoint {
  code: string;
  text: string;
}

/**
 * A self-contained playground type (spring, tween, stagger...). Adding one is a
 * single module plus a line in `items/index.ts` — the shell stays untouched.
 */
export interface PlaygroundItem {
  slug: string;
  label: string;
  blurb: string;
  /** Phase-2 types render in the sidebar as disabled "soon" rows. */
  comingSoon?: boolean;
  controls: ControlDef[];
  defaults: Values;
  presets: Preset[];
  /** The primitive subject that visualizes the current values. */
  Preview: FC<{ values: Values; replayKey: number }>;
  /** Copy-paste `motion/react` snippet for the current values. */
  toCode: (values: Values) => string;
  /** Plain-English decode of the current code, for first-time learners. */
  explain: (values: Values) => ExplainPoint[];
  /**
   * Optional: adjust dependent controls when one changes (e.g. reset the
   * keyframe list when the animated property switches). Receives the changed
   * key and the already-updated values; returns the final values to store.
   */
  coerce?: (key: string, next: Values) => Values;
}

/** Read a numeric control value with a fallback. */
export function num(values: Values, key: string, fallback = 0): number {
  const v = values[key];
  return typeof v === "number" ? v : fallback;
}

/** Read a string control value with a fallback. */
export function str(values: Values, key: string, fallback = ""): string {
  const v = values[key];
  return typeof v === "string" ? v : fallback;
}

/** Read a number[] control value (e.g. a cubic-bezier) with a fallback. */
export function arr(values: Values, key: string, fallback: number[]): number[] {
  const v = values[key];
  return Array.isArray(v) ? v : fallback;
}
