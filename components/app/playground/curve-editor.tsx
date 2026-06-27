"use client";

import { useRef, useState } from "react";

const SIZE = 200;
const PAD = 34; // room for overshoot handles past the 0..1 core
const CORE = SIZE - PAD * 2;
// y domain allows overshoot beyond [0,1] (e.g. EASE_OUT peaks at y=1).
const Y_MIN = -0.4;
const Y_MAX = 1.4;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

// domain (0..1 x, Y_MIN..Y_MAX y) -> svg pixels
const px = (x: number) => PAD + x * CORE;
const py = (y: number) => PAD + (Y_MAX - y) * (CORE / (Y_MAX - Y_MIN));
// svg pixels -> domain
const toX = (p: number) => clamp((p - PAD) / CORE, 0, 1);
const toY = (p: number) =>
  clamp(Y_MAX - (p - PAD) / (CORE / (Y_MAX - Y_MIN)), Y_MIN, Y_MAX);

export function CurveEditor({
  value,
  onChange,
}: {
  value: number[];
  onChange: (next: number[]) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<0 | 1 | null>(null);
  const [x1, y1, x2, y2] = value;

  const move = (e: React.PointerEvent, handle: 0 | 1) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = toX(((e.clientX - rect.left) / rect.width) * SIZE);
    const y = toY(((e.clientY - rect.top) / rect.height) * SIZE);
    onChange(handle === 0 ? [x, y, x2, y2] : [x1, y1, x, y]);
  };

  const start = px(0);
  const startY = py(0);
  const end = px(1);
  const endY = py(1);
  const c1x = px(x1);
  const c1y = py(y1);
  const c2x = px(x2);
  const c2y = py(y2);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full touch-none select-none rounded-xl border border-border bg-background"
      // a global pointermove while dragging keeps tracking outside the handle
      onPointerMove={(e) => drag !== null && move(e, drag)}
      onPointerUp={() => setDrag(null)}
      onPointerLeave={() => setDrag(null)}
      aria-label="Easing curve editor"
    >
      {/* baseline 0 and 1 guides */}
      <line x1={PAD} y1={py(0)} x2={SIZE - PAD} y2={py(0)} className="stroke-border" strokeWidth={1} strokeDasharray="3 3" />
      <line x1={PAD} y1={py(1)} x2={SIZE - PAD} y2={py(1)} className="stroke-border" strokeWidth={1} strokeDasharray="3 3" />

      {/* handle leashes */}
      <line x1={start} y1={startY} x2={c1x} y2={c1y} className="stroke-primary/40" strokeWidth={1.5} />
      <line x1={end} y1={endY} x2={c2x} y2={c2y} className="stroke-primary/40" strokeWidth={1.5} />

      {/* the curve */}
      <path
        d={`M ${start} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${end} ${endY}`}
        className="fill-none stroke-foreground"
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* fixed endpoints */}
      <circle cx={start} cy={startY} r={3} className="fill-muted-foreground" />
      <circle cx={end} cy={endY} r={3} className="fill-muted-foreground" />

      {/* draggable control points */}
      {([0, 1] as const).map((h) => (
        <circle
          key={h}
          cx={h === 0 ? c1x : c2x}
          cy={h === 0 ? c1y : c2y}
          r={7}
          className="cursor-grab fill-primary"
          onPointerDown={(e) => {
            (e.target as SVGElement).setPointerCapture(e.pointerId);
            setDrag(h);
          }}
        />
      ))}
    </svg>
  );
}
