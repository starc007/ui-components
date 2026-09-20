export interface FunnelStage {
  /** Keep IDs stable when updating counts. */
  id: string;
  label: string;
  value: number;
  color?: string;
}

/** Preserve stage order; omit invalid counts and repeated identities. */
export function buildFunnel(stages: readonly FunnelStage[]) {
  const seen = new Set<string>();
  const valid = stages.filter((stage) => {
    if (seen.has(stage.id) || !Number.isFinite(stage.value) || stage.value < 0) return false;
    seen.add(stage.id);
    return true;
  });
  const first = valid[0]?.value ?? 0;
  const last = valid.at(-1)?.value ?? 0;
  const maximum = valid.reduce((max, stage) => Math.max(max, stage.value), 0);
  const rows = valid.map((stage, index) => {
    const previous = valid[index - 1]?.value;
    return {
      ...stage,
      proportion: maximum > 0 ? stage.value / maximum : 0,
      conversion: first > 0 ? (stage.value / first) * 100 : null,
      stepConversion:
        previous !== undefined && previous > 0 ? (stage.value / previous) * 100 : null,
      change: previous === undefined ? null : stage.value - previous,
    };
  });
  return { rows, first, last, conversion: first > 0 ? (last / first) * 100 : null };
}

/** Each stage's center width encodes its value; shared boundaries join without gaps. */
export function funnelPath(
  proportions: readonly number[],
  index: number,
  direction: "vertical" | "horizontal",
) {
  const value = proportions[index];
  const top = index === 0 ? value : (proportions[index - 1] + value) / 2;
  const bottom = index === proportions.length - 1 ? value : (value + proportions[index + 1]) / 2;
  const start = index / proportions.length;
  const end = (index + 1) / proportions.length;
  const middle = (start + end) / 2;
  const quarter = (end - start) / 4;
  const point = (cross: number, along: number) =>
    direction === "vertical" ? `${cross * 1000},${along * 500}` : `${along * 1000},${cross * 500}`;
  const left = (width: number) => 0.5 - width * 0.46;
  const right = (width: number) => 0.5 + width * 0.46;
  return `M${point(left(top), start)} L${point(right(top), start)} C${point(right(top), start + quarter)} ${point(right(value), middle - quarter)} ${point(right(value), middle)} C${point(right(value), middle + quarter)} ${point(right(bottom), end - quarter)} ${point(right(bottom), end)} L${point(left(bottom), end)} C${point(left(bottom), end - quarter)} ${point(left(value), middle + quarter)} ${point(left(value), middle)} C${point(left(value), middle - quarter)} ${point(left(top), start + quarter)} ${point(left(top), start)} Z`;
}
