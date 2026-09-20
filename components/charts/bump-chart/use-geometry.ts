"use client";

import { animate, motionValue, type MotionValue } from "motion/react";
import { useLayoutEffect, useState } from "react";
import { SPRING_LAYOUT } from "@/lib/ease";

export type BumpPosition = { x: MotionValue<number>; y: MotionValue<number> };
export type BumpTarget = { key: string; x: number; y: number };
export const pointKey = (series: string, period: string) => JSON.stringify([series, period]);

/** The curves, dots, and end labels all read these exact same animated coordinates. */
export function useBumpGeometry(targets: BumpTarget[], reduce: boolean) {
  const shape = JSON.stringify(targets.map((target) => target.key));
  const create = (previous?: Map<string, BumpPosition>) =>
    new Map(
      targets.map((target) => [
        target.key,
        previous?.get(target.key) ?? { x: motionValue(target.x), y: motionValue(target.y) },
      ]),
    );
  const [stored, setStored] = useState(() => ({ shape, positions: create() }));
  let positions = stored.positions;
  if (stored.shape !== shape) {
    positions = create(stored.positions);
    setStored({ shape, positions });
  }
  // Hover/focus renders do not restart a running transition. Only new geometry does.
  const snapshot = JSON.stringify(targets);
  useLayoutEffect(() => {
    const next: BumpTarget[] = JSON.parse(snapshot);
    const controls: ReturnType<typeof animate>[] = [];
    for (const target of next) {
      const position = positions.get(target.key);
      if (!position) continue;
      for (const axis of ["x", "y"] as const) {
        if (reduce) position[axis].jump(target[axis]);
        else controls.push(animate(position[axis], target[axis], SPRING_LAYOUT));
      }
    }
    return () => {
      for (const control of controls) control.stop();
    };
  }, [snapshot, reduce, positions]);
  return positions;
}
