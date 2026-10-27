export type XYCurve = "monotone" | "linear" | "step";
export type XYPathPoint = { x: number; y: number } | null;

const f = (value: number) => Math.round(value * 100) / 100;

/** Contiguous runs. A gap in the data is a gap in the line, never an interpolation. */
function runs(points: readonly XYPathPoint[]) {
  const out: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  for (const point of points) {
    if (point) run.push(point);
    else if (run.length) {
      out.push(run);
      run = [];
    }
  }
  if (run.length) out.push(run);
  return out;
}

// Monotone cubic interpolation (Fritsch–Carlson): smooth, but it never
// overshoots a local peak or dips below a local trough the data doesn't have.
function tangents(run: { x: number; y: number }[]) {
  const n = run.length;
  const t = new Array<number>(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const h0 = run[i].x - run[i - 1].x;
    const h1 = run[i + 1].x - run[i].x;
    const s0 = h0 ? (run[i].y - run[i - 1].y) / h0 : 0;
    const s1 = h1 ? (run[i + 1].y - run[i].y) / h1 : 0;
    const p = h0 + h1 ? (s0 * h1 + s1 * h0) / (h0 + h1) : 0;
    t[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
  }
  const end = (a: number, b: number, neighbour: number) => {
    const h = run[b].x - run[a].x;
    return h ? (3 * (run[b].y - run[a].y)) / h / 2 - neighbour / 2 : neighbour;
  };
  t[0] = end(0, 1, t[1]);
  t[n - 1] = end(n - 2, n - 1, t[n - 2]);
  return t;
}

function segment(run: { x: number; y: number }[], curve: XYCurve) {
  const [first, ...rest] = run;
  let d = `M${f(first.x)},${f(first.y)}`;
  // A lone sample draws as a dot with a round line cap.
  if (!rest.length) return `${d}h0`;
  if (curve === "linear" || run.length === 2) {
    for (const p of rest) d += `L${f(p.x)},${f(p.y)}`;
    return d;
  }
  if (curve === "step") {
    for (let i = 1; i < run.length; i++) {
      const mid = (run[i - 1].x + run[i].x) / 2;
      d += `H${f(mid)}V${f(run[i].y)}`;
    }
    return `${d}H${f(run[run.length - 1].x)}`;
  }
  const t = tangents(run);
  for (let i = 1; i < run.length; i++) {
    const a = run[i - 1];
    const b = run[i];
    const dx = (b.x - a.x) / 3;
    d += `C${f(a.x + dx)},${f(a.y + dx * t[i - 1])},${f(b.x - dx)},${f(b.y - dx * t[i])},${f(b.x)},${f(b.y)}`;
  }
  return d;
}

export function linePath(points: readonly XYPathPoint[], curve: XYCurve = "monotone") {
  return runs(points)
    .map((run) => segment(run, curve))
    .join("");
}

/** Close each run down to the baseline. Lone samples have no area to fill. */
export function areaPath(
  points: readonly XYPathPoint[],
  baseline: number,
  curve: XYCurve = "monotone",
) {
  return runs(points)
    .filter((run) => run.length > 1)
    .map(
      (run) =>
        `${segment(run, curve)}L${f(run[run.length - 1].x)},${f(baseline)}L${f(run[0].x)},${f(baseline)}Z`,
    )
    .join("");
}
