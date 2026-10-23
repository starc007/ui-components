export interface SankeyNode {
  id: string;
  label: string;
  /** Any CSS color. Defaults to the palette, in node order. */
  color?: string;
  description?: string;
}

export interface SankeyLink {
  /** Defaults to `${source}:${target}`. */
  id?: string;
  source: string;
  target: string;
  /** Positive value. Zero, negative and invalid values are left out. */
  value: number;
}

export type PlacedNode = Required<Pick<SankeyNode, "id" | "label" | "color">> & {
  description?: string;
  /** Larger of the node's incoming and outgoing totals. */
  value: number;
  inValue: number;
  outValue: number;
  /** Column, counted from the sources. */
  depth: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export type PlacedLink = {
  id: string;
  source: PlacedNode;
  target: PlacedNode;
  value: number;
  /** Share of the source node's value, from 0 to 1. */
  share: number;
  /** Band thickness. */
  width: number;
  /** Centerline ends: leaving the source and arriving at the target. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Centerline cubic path; stroke it at `width`. */
  path: string;
};

export const SANKEY_COLORS = [
  "#1d4ed8",
  "#7c3aed",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#475569",
] as const;

/** Relaxation passes; more settles crossings further at a small cost. */
const ITERATIONS = 6;

export const linkId = (link: SankeyLink) => link.id ?? `${link.source}:${link.target}`;

export type SankeyData = {
  nodes: SankeyNode[];
  links: SankeyLink[];
  /** Links left out, by reason, for the development warning. */
  dropped: { invalid: SankeyLink[]; cycle: SankeyLink[] };
};

/**
 * Cleans consumer data once per change, not per resize:
 * - repeated node ids keep the first node;
 * - links to unknown nodes, self links and non-positive or non-finite values
 *   are dropped;
 * - unnamed links between the same pair are summed into one band, while a
 *   repeated explicit id keeps the first link;
 * - a link closing a cycle is dropped: one whose target is still on the
 *   depth-first path that reached its source, so the first-listed direction
 *   of a loop survives.
 */
export function cleanSankey(
  nodes: readonly SankeyNode[],
  links: readonly SankeyLink[],
): SankeyData {
  const byId = new Map<string, SankeyNode>();
  for (const node of nodes) if (!byId.has(node.id)) byId.set(node.id, node);
  const unique = [...byId.values()];

  const invalid: SankeyLink[] = [];
  const merged = new Map<string, SankeyLink>();
  for (const link of links) {
    const ok =
      byId.has(link.source) &&
      byId.has(link.target) &&
      link.source !== link.target &&
      Number.isFinite(link.value) &&
      link.value > 0;
    if (!ok) {
      invalid.push(link);
      continue;
    }
    const id = linkId(link);
    const existing = merged.get(id);
    if (!existing) merged.set(id, { ...link, id });
    else if (link.id === undefined && existing.source === link.source && existing.target === link.target)
      existing.value += link.value;
    else invalid.push(link);
  }
  const valid = [...merged.values()];

  const outgoing = new Map<string, SankeyLink[]>();
  for (const link of valid) {
    outgoing.set(link.source, [...(outgoing.get(link.source) ?? []), link]);
  }
  const state = new Map<string, "open" | "done">();
  const back = new Set<SankeyLink>();
  // Iterative depth-first search, so a very long chain cannot overflow the stack.
  for (const root of unique) {
    if (state.has(root.id)) continue;
    const stack: { id: string; next: number }[] = [{ id: root.id, next: 0 }];
    state.set(root.id, "open");
    while (stack.length) {
      const frame = stack[stack.length - 1];
      const edges = outgoing.get(frame.id) ?? [];
      if (frame.next >= edges.length) {
        state.set(frame.id, "done");
        stack.pop();
        continue;
      }
      const link = edges[frame.next++];
      const seen = state.get(link.target);
      if (seen === "open") back.add(link);
      else if (seen === undefined) {
        state.set(link.target, "open");
        stack.push({ id: link.target, next: 0 });
      }
    }
  }
  return {
    nodes: unique,
    links: valid.filter((link) => !back.has(link)),
    dropped: { invalid, cycle: valid.filter((link) => back.has(link)) },
  };
}

/**
 * Lays nodes out in columns by their longest path from a source, with sinks
 * pushed to the last column, then sizes them to their value and relaxes each
 * column toward its neighbours to shorten the links. Each column keeps the
 * order the nodes were given in, so order them to avoid crossings.
 */
export function layoutSankey(
  { nodes, links: kept }: SankeyData,
  {
    width,
    height,
    nodeWidth,
    nodePadding,
    colors,
  }: {
    width: number;
    height: number;
    nodeWidth: number;
    nodePadding: number;
    colors: readonly string[];
  },
) {
  const inValue = new Map<string, number>();
  const outValue = new Map<string, number>();
  for (const link of kept) {
    outValue.set(link.source, (outValue.get(link.source) ?? 0) + link.value);
    inValue.set(link.target, (inValue.get(link.target) ?? 0) + link.value);
  }

  // Longest-path depth over the acyclic links, in topological order.
  const indegree = new Map<string, number>();
  for (const link of kept) indegree.set(link.target, (indegree.get(link.target) ?? 0) + 1);
  const depth = new Map<string, number>();
  const queue = nodes.filter((node) => !indegree.get(node.id)).map((node) => node.id);
  for (const id of queue) depth.set(id, 0);
  for (let i = 0; i < queue.length; i++) {
    const id = queue[i];
    for (const link of kept) {
      if (link.source !== id) continue;
      depth.set(link.target, Math.max(depth.get(link.target) ?? 0, (depth.get(id) ?? 0) + 1));
      const left = (indegree.get(link.target) ?? 0) - 1;
      indegree.set(link.target, left);
      if (left === 0) queue.push(link.target);
    }
  }

  const linked = nodes.filter((node) => inValue.has(node.id) || outValue.has(node.id));
  if (!linked.length || width <= 0 || height <= 0) {
    return { nodes: [] as PlacedNode[], links: [] as PlacedLink[], columns: 0, step: 0 };
  }
  const maxDepth = Math.max(0, ...linked.map((node) => depth.get(node.id) ?? 0));
  const columns = maxDepth + 1;
  const step = columns > 1 ? (width - nodeWidth) / (columns - 1) : 0;

  const placed: PlacedNode[] = linked.map((node) => {
    const index = nodes.indexOf(node);
    const value = Math.max(inValue.get(node.id) ?? 0, outValue.get(node.id) ?? 0);
    // Sinks sit in the last column, so every outcome lines up on the right.
    const d = outValue.has(node.id) ? (depth.get(node.id) ?? 0) : maxDepth;
    return {
      id: node.id,
      label: node.label,
      description: node.description,
      color: node.color ?? colors[index % colors.length],
      value,
      inValue: inValue.get(node.id) ?? 0,
      outValue: outValue.get(node.id) ?? 0,
      depth: d,
      x0: d * step,
      x1: d * step + nodeWidth,
      y0: 0,
      y1: 0,
    };
  });
  const byId = new Map(placed.map((node) => [node.id, node]));
  const byColumn = Array.from({ length: columns }, (_, d) =>
    placed.filter((node) => node.depth === d),
  );

  // One scale for every column: the fullest column fills the height.
  const padding = Math.min(
    nodePadding,
    ...byColumn.map((column) =>
      column.length > 1 ? (height * 0.5) / (column.length - 1) : nodePadding,
    ),
  );
  const ky = Math.min(
    ...byColumn
      .filter((column) => column.length)
      .map(
        (column) =>
          (height - (column.length - 1) * padding) /
          column.reduce((sum, node) => sum + node.value, 0),
      ),
  );
  for (const column of byColumn) {
    let y = 0;
    for (const node of column) {
      node.y0 = y;
      node.y1 = y + node.value * ky;
      y = node.y1 + padding;
    }
    // Center columns shorter than the fullest one.
    const offset = (height - (y - padding)) / 2;
    for (const node of column) {
      node.y0 += offset;
      node.y1 += offset;
    }
  }

  // Columns keep the order nodes were given in, so the same data in a new
  // period morphs in place instead of swapping nodes past each other.
  // Relaxation only moves a node within the room its neighbours leave.
  const resolve = (column: PlacedNode[]) => {
    let y = 0;
    for (const node of column) {
      const dy = y - node.y0;
      if (dy > 0) {
        node.y0 += dy;
        node.y1 += dy;
      }
      y = node.y1 + padding;
    }
    y = height;
    for (let i = column.length - 1; i >= 0; i--) {
      const node = column[i];
      const dy = node.y1 - y;
      if (dy > 0) {
        node.y0 -= dy;
        node.y1 -= dy;
      }
      y = node.y0 - padding;
    }
  };
  const center = (node: PlacedNode) => (node.y0 + node.y1) / 2;
  const relax = (column: PlacedNode[], alpha: number, side: "source" | "target") => {
    for (const node of column) {
      let weighted = 0;
      let total = 0;
      for (const link of kept) {
        const self = side === "source" ? link.target : link.source;
        if (self !== node.id) continue;
        const other = byId.get(side === "source" ? link.source : link.target);
        if (!other) continue;
        weighted += center(other) * link.value;
        total += link.value;
      }
      if (!total) continue;
      const dy = (weighted / total - center(node)) * alpha;
      node.y0 += dy;
      node.y1 += dy;
    }
    resolve(column);
  };
  for (let i = 0; i < ITERATIONS; i++) {
    const alpha = 0.99 ** i;
    for (let d = 1; d < columns; d++) relax(byColumn[d], alpha, "source");
    for (let d = columns - 2; d >= 0; d--) relax(byColumn[d], alpha, "target");
  }

  // Stack each node's links in the order of the nodes they reach, so bands
  // leave and arrive without crossing at the node.
  const placedLinks = kept.map((link) => ({
    link,
    source: byId.get(link.source) as PlacedNode,
    target: byId.get(link.target) as PlacedNode,
    sy: 0,
    ty: 0,
  }));
  for (const node of placed) {
    let sy = node.y0;
    for (const entry of placedLinks
      .filter((entry) => entry.source === node)
      .sort((a, b) => a.target.y0 - b.target.y0)) {
      entry.sy = sy;
      sy += entry.link.value * ky;
    }
    let ty = node.y0;
    for (const entry of placedLinks
      .filter((entry) => entry.target === node)
      .sort((a, b) => a.source.y0 - b.source.y0)) {
      entry.ty = ty;
      ty += entry.link.value * ky;
    }
  }

  const result: PlacedLink[] = placedLinks.map(({ link, source, target, sy, ty }) => {
    const w = link.value * ky;
    const x0 = source.x1;
    const x1 = target.x0;
    const y0 = sy + w / 2;
    const y1 = ty + w / 2;
    const xm = (x0 + x1) / 2;
    return {
      id: linkId(link),
      source,
      target,
      value: link.value,
      share: source.value ? link.value / source.value : 0,
      width: w,
      x0,
      y0,
      x1,
      y1,
      path: `M ${x0} ${y0} C ${xm} ${y0} ${xm} ${y1} ${x1} ${y1}`,
    };
  });

  // Reading order for keyboard focus: column by column, top to bottom.
  const ordered = byColumn.flat();
  return { nodes: ordered, links: result, columns, step };
}
