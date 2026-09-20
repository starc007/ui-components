"use client";

import { useId, useRef } from "react";
import { motion, useTransform, useMotionValueEvent } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { useBumpChart } from "./context";
import { bumpPath, PLOT } from "./model";
import type { BumpPosition } from "./use-geometry";

type Row = ReturnType<typeof useBumpChart>["rows"][number];

export function BumpChartSeriesPath({
  row,
  positions,
  index,
}: {
  row: Row;
  positions: (BumpPosition | null)[];
  index: number;
}) {
  const { height, highlighted, setHovered, canHover, reduce } = useBumpChart();
  const clip = useId();
  const values = positions.flatMap((point) => (point ? [point.x, point.y] : []));
  const path = useTransform(values, (coordinates: number[]) => {
    let cursor = 0;
    const points = positions.map((point) =>
      point ? { x: coordinates[cursor++], y: coordinates[cursor++] } : null,
    );
    return bumpPath(
      points.map((point) => point?.y ?? null),
      (i) => points[i]?.x ?? 0,
      (value) => value,
    );
  });
  const last = positions.at(-1);
  const labelTransform = useTransform(
    values,
    () => `translate(${last?.x.get() ?? 0} ${last?.y.get() ?? 0})`,
  );
  const labelRef = useRef<SVGGElement>(null);
  useMotionValueEvent(labelTransform, "change", (transform) => {
    labelRef.current?.setAttribute("transform", transform);
  });
  const dimmed = highlighted !== null && highlighted !== row.id;
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: dimmed ? 0.22 : 1 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
      onPointerEnter={() => {
        if (canHover) setHovered(row.id);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <defs>
        <clipPath id={clip}>
          <motion.rect
            x="0"
            y="0"
            width={PLOT.width}
            height={height}
            initial={reduce ? false : { transform: "scaleX(0)" }}
            animate={{ transform: "scaleX(1)" }}
            transition={{ duration: 0.28, delay: Math.min(index, 4) * 0.025, ease: EASE_OUT }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        {/* SVG geometry must reshape with the animated points; transforming a whole path cannot express new ranks. */}
        <motion.path d={path} stroke={row.color} strokeWidth="2" fill="none" />
        <motion.path
          d={path}
          stroke={row.color}
          strokeWidth="5"
          fill="none"
          initial={false}
          animate={{ opacity: highlighted === row.id ? 0.16 : 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        />
        <motion.path d={path} stroke="transparent" strokeWidth="16" fill="none" />
      </g>
      {last && (
        <g ref={labelRef} transform={labelTransform.get()}>
          <text
            x="18"
            dominantBaseline="central"
            fill={row.color}
            className="text-[10px] font-medium"
          >
            {row.name.length > 12 ? `${row.name.slice(0, 11)}…` : row.name}
            <title>{row.name}</title>
          </text>
        </g>
      )}
    </motion.g>
  );
}
