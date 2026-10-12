"use client";

import { type MotionValue, useTransform } from "motion/react";

export interface MorphBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MorphSurface {
  /** Surface transform: at progress 0 it lays the surface exactly over `from`. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  /** Corner radius corrected per axis, so corners stay round while the surface is scaled. */
  borderRadius: MotionValue<string>;
  /**
   * Inverse scale for the content, which keeps its final size while the
   * surface trims it. Capped at 4×, so it is exact once the surface is at
   * least a quarter of its size; fade content in after that point.
   */
  contentScaleX: MotionValue<number>;
  contentScaleY: MotionValue<number>;
}

const MIN_SCALE = 0.01;
// The content's counter-scale stops here: a surface under a quarter of its
// size is too small to show content, and callers fade it in later than that,
// so the correction need not be exact there — and it keeps the content's
// raster from ballooning while the surface is a sliver.
const CONTENT_MAX_SCALE = 4;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Morphs a surface between two boxes with transforms only.
 *
 * The surface is laid out at `to`, its final box. At progress 0 its transform
 * lays it exactly over `from`; at 1 it is the identity. The content inside
 * takes the inverse scale, so it keeps its final size while the surface's
 * overflow clip trims it — the correction Motion's layout projection applies,
 * driven here by one progress value so the surface, its corners and its
 * content share a single curve. Everything written per frame is a transform,
 * so the morph stays on the compositor. A spring may overshoot past 1; the
 * surface then overshoots its box like a real object would.
 *
 * The boxes only need a shared origin: viewport coordinates, or any local box.
 */
export function useMorphSurface(
  progress: MotionValue<number>,
  from: MorphBox | null,
  to: MorphBox | null,
  radius: number,
): MorphSurface {
  const ready = from !== null && to !== null && to.width > 0 && to.height > 0;
  const fromScaleX = ready ? from.width / to.width : 1;
  const fromScaleY = ready ? from.height / to.height : 1;
  const fromX = ready ? from.left - to.left : 0;
  const fromY = ready ? from.top - to.top : 0;

  const x = useTransform(progress, (p) => lerp(fromX, 0, p));
  const y = useTransform(progress, (p) => lerp(fromY, 0, p));
  const scaleX = useTransform(progress, (p) =>
    Math.max(MIN_SCALE, lerp(fromScaleX, 1, p)),
  );
  const scaleY = useTransform(progress, (p) =>
    Math.max(MIN_SCALE, lerp(fromScaleY, 1, p)),
  );
  const borderRadius = useTransform(
    [scaleX, scaleY],
    ([sx, sy]: number[]) => `${radius / sx}px / ${radius / sy}px`,
  );
  const contentScaleX = useTransform(scaleX, (s) =>
    Math.min(CONTENT_MAX_SCALE, 1 / s),
  );
  const contentScaleY = useTransform(scaleY, (s) =>
    Math.min(CONTENT_MAX_SCALE, 1 / s),
  );

  return { x, y, scaleX, scaleY, borderRadius, contentScaleX, contentScaleY };
}
