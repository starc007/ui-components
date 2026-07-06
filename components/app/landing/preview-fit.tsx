"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

// Matches the original flat scale so normal-size previews look unchanged;
// only previews bigger than the card shrink further to actually fit — no
// clipping, and the card itself stays a fixed, modest size.
const BASE_SCALE = 0.8;
const HOVER_SCALE = 0.84;
const MIN_SCALE = 0.22;

// A real desktop width for the preview to render at before it gets scaled
// down — the same idea as screenshotting the full-size preview, then
// shrinking the image. Without this, a preview whose root is `w-full` has no
// definite width to resolve against inside a shrink-wrapped box, so the
// browser collapses it to the width of its narrowest fixed-size child and
// wraps everything else around that — the "mobile view" column look.
const STAGE_WIDTH = 460;

/**
 * Shrinks a preview to fit the card frame instead of clipping or collapsing.
 * Renders the preview at a fixed desktop-like stage width (so `w-full`
 * layouts inside it lay out the same as they would on their own detail page),
 * measures the natural rendered height at that width, and scales the whole
 * stage down to fit the card — capped so normal-size previews look the same
 * as the original flat scale.
 */
export function PreviewFit({
  children,
  hover,
  overlay,
}: {
  children: ReactNode;
  hover: boolean;
  overlay?: ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const stage = stageRef.current;
    if (!outer || !stage) return;

    const measure = () => {
      // clientWidth/offsetHeight are the pre-transform layout size — unlike
      // getBoundingClientRect, which reflects the scale() applied to this
      // same element and would otherwise make each measurement read an
      // already-shrunk box, compounding into the wrong scale every render.
      const outerW = outer.clientWidth;
      const outerH = outer.clientHeight;
      const stageH = stage.offsetHeight;
      if (!outerW || !outerH || !stageH) return;
      const fit = Math.min(
        (outerW * 0.94) / STAGE_WIDTH,
        (outerH * 0.94) / stageH,
      );
      setFitScale(Math.max(MIN_SCALE, fit));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(BASE_SCALE, fitScale) * (hover ? HOVER_SCALE / BASE_SCALE : 1);

  return (
    <div
      ref={outerRef}
      className="relative mx-2 mb-2 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-3xl bg-background p-3 contain-[paint]"
    >
      <div
        ref={stageRef}
        style={{ width: STAGE_WIDTH, transform: `scale(${scale})` }}
        className="pointer-events-none flex origin-center shrink-0 items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] contain-[paint] [&_*]:!cursor-default"
      >
        {children}
      </div>
      {overlay}
    </div>
  );
}
