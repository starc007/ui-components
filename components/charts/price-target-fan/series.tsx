"use client";

import { motion } from "motion/react";
import { EASE_OUT, SPRING_GLIDE, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { usePriceTargetFan } from "./context";
import { H, ink, PAD } from "./utils";

export function PriceTargetFanHistory({ className }: { className?: string }) {
  const { hist, history, scrub, setScrub, setActive, tooltipId, fmt, geo, reduce, drawn } =
    usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {hist.length ? (
        <g
          role="slider"
          tabIndex={0}
          aria-label="Price history"
          aria-valuemin={0}
          aria-valuemax={hist.length - 1}
          aria-valuenow={scrub ?? hist.length - 1}
          aria-valuetext={`${history[scrub ?? hist.length - 1].date}: ${fmt(hist[scrub ?? hist.length - 1])}`}
          aria-describedby={scrub !== null ? tooltipId : undefined}
          onFocus={() => setScrub(hist.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(event) => {
            const index = scrub ?? hist.length - 1;
            if (event.key === "Escape") {
              event.preventDefault();
              setActive(null);
            } else if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              setScrub(
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? hist.length - 1
                    : Math.max(0, Math.min(hist.length - 1, index + (event.key === "ArrowRight" ? 1 : -1))),
              );
            }
          }}
        >
          {" "}
          {/* history draws itself to now */}
          <motion.path
            data-price-history=""
            d={geo.line}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={1.5}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={drawn ?? { duration: 0.9, ease: EASE_OUT }}
          />
        </g>
      ) : null}
    </g>
  );
}

export function PriceTargetFanTargets({ className }: { className?: string }) {
  const { geo, hotT, setHotT, setActive, tooltipId, clipId, reduce, drawn, fmt } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* projections and target labels */}
      <g clipPath={`url(#${clipId})`}>
        {geo.proj.map((p, i) => {
          const on = hotT === i;
          const dim = hotT !== null && !on;
          return (
            <motion.g
              key={p.key}
              role="button"
              tabIndex={0}
              aria-label={`${p.key} target ${fmt(p.price)}, ${p.analysts} analysts`}
              className="outline-none"
              aria-pressed={on}
              aria-describedby={on ? tooltipId : undefined}
              initial={{ opacity: 1 }}
              animate={{ opacity: dim ? 0.3 : 1 }}
              transition={drawn ?? { duration: 0.25, ease: EASE_OUT }}
              onFocus={() => setHotT(i)}
              onBlur={() => setHotT(null)}
              // a tap toggles on touch, where hover never fires; mouse and pen keep hover
              onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                  e.preventDefault();
                  setHotT(on ? null : i);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setActive(null);
                }
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setHotT(on ? null : i);
                }
              }}
            >
              <path d={p.d} fill="none" stroke="transparent" strokeWidth={16} />
              <path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={on ? 2.2 : 1.4}
                strokeOpacity={on ? 1 : 0.75}
                strokeDasharray="2 4"
                strokeLinecap="round"
              />
              {/* the hot projection draws itself solid over the dashes, base to target */}
              {on && (
                <motion.path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={drawn ?? { duration: 0.35, ease: EASE_OUT }}
                />
              )}
              <motion.circle
                cx={geo.endX}
                cy={p.ty}
                fill="var(--background)"
                stroke={p.color}
                strokeWidth={1.6}
                r={3.2}
                animate={{ r: on ? 4.5 : 3.2 }}
                transition={drawn ?? SPRING_PANEL}
              />
              <text
                x={geo.endX + 10}
                y={p.ty + 4}
                fontSize={11}
                fontWeight={600}
                fill={ink(p.color)}
                className="font-mono tabular-nums"
              >
                {p.price}
              </text>
            </motion.g>
          );
        })}
      </g>
    </g>
  );
}

export function PriceTargetFanNow({ className }: { className?: string }) {
  const { geo, reduce, drawn } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* the now dot lands as the history arrives */}
      <motion.circle
        cx={geo.nowX}
        cy={geo.nowY}
        r={3.2}
        fill="var(--foreground)"
        initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={drawn ?? { ...SPRING_PANEL, delay: 0.85 }}
        style={{ transformOrigin: `${geo.nowX}px ${geo.nowY}px` }}
      />
      {/* the live tail: a ring leaves the now dot every few seconds */}
      {!reduce && (
        <motion.circle
          cx={geo.nowX}
          cy={geo.nowY}
          r={3.2}
          fill="none"
          stroke="var(--foreground)"
          strokeWidth={1}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: [0.45, 0], scale: [1, 2.8] }}
          transition={{
            duration: 2.2,
            ease: EASE_OUT,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 1.6,
            delay: 1.6,
          }}
          style={{ transformOrigin: `${geo.nowX}px ${geo.nowY}px` }}
        />
      )}
    </g>
  );
}

export function PriceTargetFanCursor({ className }: { className?: string }) {
  const { scrub, geo, y, hist, fadeId, reduce } = usePriceTargetFan();
  return (
    <g className={cn(className)}>
      {/* the scrub crosshair: it flows along the history on a spring instead of
              stepping cell to cell, so a slow drag reads as one continuous read-out */}
      {scrub !== null && (
        <g pointerEvents="none">
          <motion.line
            y1={PAD.t}
            y2={H - PAD.b}
            stroke={`url(#${fadeId})`}
            strokeWidth={1}
            initial={false}
            animate={{ x1: geo.hx(scrub), x2: geo.hx(scrub) }}
            transition={reduce ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE }}
          />
          <motion.circle
            r={3.2}
            fill="var(--foreground)"
            stroke="var(--background)"
            strokeWidth={1.5}
            initial={false}
            animate={{ cx: geo.hx(scrub), cy: y(hist[scrub]) }}
            transition={reduce ? { duration: 0 } : { type: "spring", ...SPRING_GLIDE }}
          />
        </g>
      )}
    </g>
  );
}
