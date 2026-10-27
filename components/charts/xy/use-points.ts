"use client";

import { animate, type MotionValue, motionValue } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { SPRING_LAYOUT } from "@/lib/ease";

export type XYAnimatedPoint = { x: MotionValue<number>; y: MotionValue<number> };
export type XYPointTarget = { key: string; x: number; y: number };

/**
 * One spring per coordinate, keyed by identity. Paths, dots and fills read the
 * same values, so a data change morphs every mark together. A resize jumps:
 * the data didn't change, so nothing should appear to move.
 */
export function useAnimatedPoints(targets: XYPointTarget[], reduce: boolean, width: number) {
  const shape = targets.map((target) => target.key).join("\n");
  const create = (previous?: Map<string, XYAnimatedPoint>) =>
    new Map(
      targets.map((target) => [
        target.key,
        previous?.get(target.key) ?? { x: motionValue(target.x), y: motionValue(target.y) },
      ]),
    );
  const [stored, setStored] = useState(() => ({ shape, points: create() }));
  let points = stored.points;
  if (stored.shape !== shape) {
    points = create(stored.points);
    setStored({ shape, points });
  }
  const lastWidth = useRef(width);
  // Hover and focus renders produce the same snapshot, so they never restart a spring.
  const snapshot = JSON.stringify(targets);
  useLayoutEffect(() => {
    const resized = lastWidth.current !== width;
    lastWidth.current = width;
    const next: XYPointTarget[] = JSON.parse(snapshot);
    const controls: ReturnType<typeof animate>[] = [];
    for (const target of next) {
      const point = points.get(target.key);
      if (!point) continue;
      for (const axis of ["x", "y"] as const) {
        if (reduce || resized) point[axis].jump(target[axis]);
        else controls.push(animate(point[axis], target[axis], SPRING_LAYOUT));
      }
    }
    return () => {
      for (const control of controls) control.stop();
    };
  }, [snapshot, reduce, points, width]);
  return points;
}
