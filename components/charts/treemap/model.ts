interface TreemapBase {
  /** Unique across the whole tree. Retain IDs when updating values. */
  id: string;
  label: string;
  color?: string;
  textColor?: string;
  description?: string;
}

export interface TreemapLeaf extends TreemapBase {
  /** Finite, nonnegative weight. Zero values stay in the accessible table. */
  value: number;
}

export interface TreemapGroup extends TreemapBase {
  /** Group weights are derived from their leaves; groups never add their own value. */
  children: readonly TreemapNode[];
}

export type TreemapNode = TreemapLeaf | TreemapGroup;

export interface TreemapItem extends TreemapLeaf {
  color: string;
  textColor: string;
  path: readonly string[];
  share: number;
}

interface ResolvedNode {
  id: string;
  label: string;
  value: number;
  color: string;
  children: ResolvedNode[];
  item: TreemapItem | null;
}

export interface TreemapTile extends TreemapItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TREEMAP_COLORS = [
  "#1d4ed8",
  "#7c3aed",
  "#0f766e",
  "#b45309",
  "#be123c",
  "#475569",
] as const;

export function buildTreemap(
  data: readonly TreemapNode[],
  colors: readonly string[],
  textColor: string,
) {
  if (!colors.length) throw new Error("Treemap: colors must contain at least one color.");
  const ids = new Set<string>();
  const items: TreemapItem[] = [];
  const resolve = (
    node: TreemapNode,
    path: readonly string[],
    inheritedColor: string,
    inheritedText: string,
  ): ResolvedNode => {
    if (ids.has(node.id)) throw new Error(`Treemap: duplicate node ID "${node.id}".`);
    ids.add(node.id);
    const color = node.color ?? inheritedColor;
    const foreground = node.textColor ?? inheritedText;
    const nextPath = [...path, node.label];
    if ("children" in node) {
      const children = node.children.map((child) => resolve(child, nextPath, color, foreground));
      const value = children.reduce((sum, child) => sum + child.value, 0);
      if (!Number.isFinite(value)) throw new Error("Treemap: group totals must remain finite.");
      return { id: node.id, label: node.label, value, color, children, item: null };
    }
    if (!Number.isFinite(node.value) || node.value < 0)
      throw new Error("Treemap: leaf values must be finite and nonnegative.");
    const item: TreemapItem = { ...node, color, textColor: foreground, path: nextPath, share: 0 };
    items.push(item);
    return { id: node.id, label: node.label, value: node.value, color, children: [], item };
  };
  const nodes = data.map((node, index) =>
    resolve(node, [], colors[index % colors.length], textColor),
  );
  const total = nodes.reduce((sum, node) => sum + node.value, 0);
  if (!Number.isFinite(total)) throw new Error("Treemap: the total must remain finite.");
  for (const item of items) item.share = total ? item.value / total : 0;
  return { nodes, items, total };
}

/** Order-preserving balanced binary tiling, recursively applied to groups.
 * See https://d3js.org/d3-hierarchy/treemap#treemapBinary for the tiling method.
 * The calculation is local and never generates values or mutates consumer data. */
export function layoutTreemap(nodes: readonly ResolvedNode[], width: number, height: number) {
  const tiles: TreemapTile[] = [];
  const partition = (
    siblings: readonly ResolvedNode[],
    x: number,
    y: number,
    w: number,
    h: number,
  ) => {
    const positive = siblings.filter((node) => node.value > 0);
    if (!positive.length) return;
    if (positive.length === 1) {
      const node = positive[0];
      if (node.item) tiles.push({ ...node.item, x, y, width: w, height: h });
      else partition(node.children, x, y, w, h);
      return;
    }
    const total = positive.reduce((sum, node) => sum + node.value, 0);
    let cut = 1;
    let subtotal = positive[0].value;
    for (let i = 1; i < positive.length - 1; i++) {
      const next = subtotal + positive[i].value;
      if (Math.abs(next - total / 2) > Math.abs(subtotal - total / 2)) break;
      cut = i + 1;
      subtotal = next;
    }
    const fraction = subtotal / total;
    if (w >= h) {
      const split = w * fraction;
      partition(positive.slice(0, cut), x, y, split, h);
      partition(positive.slice(cut), x + split, y, w - split, h);
    } else {
      const split = h * fraction;
      partition(positive.slice(0, cut), x, y, w, split);
      partition(positive.slice(cut), x, y + split, w, h - split);
    }
  };
  partition(nodes, 0, 0, width, height);
  return tiles.filter((tile) => tile.width > 0 && tile.height > 0);
}
