export interface XYDomain {
  min: number;
  max: number;
  ticks: number[];
}

const tidy = (value: number) => Number(value.toPrecision(12));

function niceStep(raw: number) {
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
}

/** Round a value range out to human tick steps (1, 2, 5 × 10ⁿ). */
export function niceDomain(
  values: readonly number[],
  { includeZero = false, count = 4, fixed }: {
    includeZero?: boolean;
    count?: number;
    fixed?: readonly [number, number];
  } = {},
): XYDomain {
  let min = fixed?.[0] ?? (values.length ? Math.min(...values) : 0);
  let max = fixed?.[1] ?? (values.length ? Math.max(...values) : 1);
  if (includeZero && !fixed) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) {
    if (min === 0) max = 1;
    else if (includeZero && min > 0) min = 0;
    else {
      const pad = Math.abs(min) * 0.1;
      min -= pad;
      max += pad;
    }
  }
  const step = niceStep((max - min) / count);
  const lo = fixed ? min : tidy(Math.floor(min / step) * step);
  const hi = fixed ? max : tidy(Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let tick = Math.ceil(lo / step) * step; tick <= hi + step / 1e6; tick += step)
    ticks.push(tidy(tick));
  return { min: lo, max: hi, ticks };
}

/** Show every nth label so neighbours never overlap. */
export function labelStride(count: number, length: number, minGap = 64) {
  if (count <= 1 || length <= 0) return 1;
  return Math.max(1, Math.ceil((count * minGap) / length));
}
