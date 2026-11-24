export const VIEWPORT_PADDING = 8;
// The panel's border and padding, so a submenu's first row lines up with the
// row that opened it.
export const SUB_ALIGN_OFFSET = 9;
// How far a submenu stacked under its row sits in, so it reads as nested.
export const SUB_STACK_INDENT = 16;

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";
export type Point = { x: number; y: number };

export type Placement = {
  left: number;
  top: number;
  side: Side;
  origin: string;
  /** The room on the chosen side; a taller menu scrolls inside it. */
  maxHeight: number;
};

export type Rect = { left: number; top: number; width: number; height: number };

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

export function insidePolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function placeVertical(
  trigger: Rect,
  size: { width: number; height: number },
  side: "top" | "bottom",
  align: Align,
  offset: number,
): Placement {
  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = window.innerHeight;
  const below = trigger.top + trigger.height + offset;
  const roomBelow = viewHeight - VIEWPORT_PADDING - below;
  const roomAbove = trigger.top - offset - VIEWPORT_PADDING;
  // The preferred side when the menu fits there, otherwise the roomier one.
  const used =
    side === "bottom"
      ? size.height <= roomBelow || roomBelow >= roomAbove
        ? "bottom"
        : "top"
      : size.height <= roomAbove || roomAbove >= roomBelow
        ? "top"
        : "bottom";
  const maxHeight = Math.max(used === "bottom" ? roomBelow : roomAbove, 0);
  const height = Math.min(size.height, maxHeight);
  const start =
    align === "start"
      ? trigger.left
      : align === "end"
        ? trigger.left + trigger.width - size.width
        : trigger.left + trigger.width / 2 - size.width / 2;
  const x = clamp(start, VIEWPORT_PADDING, viewWidth - size.width - VIEWPORT_PADDING);
  const y = used === "bottom" ? below : trigger.top - offset - height;
  // Grow from the aligned edge, so that edge holds still while the panel
  // scales in instead of sliding sideways into place.
  const anchorX =
    align === "start"
      ? trigger.left
      : align === "end"
        ? trigger.left + trigger.width
        : trigger.left + trigger.width / 2;
  const originX = clamp(anchorX - x, 0, size.width);
  return {
    left: x,
    top: y,
    side: used,
    origin: `${originX}px ${used === "bottom" ? 0 : height}px`,
    maxHeight,
  };
}

export function place(
  trigger: Rect,
  size: { width: number; height: number },
  side: Side,
  align: Align,
  offset: number,
): Placement {
  if (side === "top" || side === "bottom") {
    return placeVertical(trigger, size, side, align, offset);
  }

  const viewWidth = document.documentElement.clientWidth;
  const viewHeight = window.innerHeight;
  const right = trigger.left + trigger.width + offset;
  const left = trigger.left - size.width - offset;
  const fitsRight = right + size.width <= viewWidth - VIEWPORT_PADDING;
  const fitsLeft = left >= VIEWPORT_PADDING;
  // A narrow screen has room on neither side: drop below the row instead of
  // covering it, the way a phone stacks a submenu.
  if (!fitsRight && !fitsLeft) {
    return placeVertical(
      { ...trigger, left: trigger.left + SUB_STACK_INDENT, width: trigger.width - SUB_STACK_INDENT },
      size,
      "bottom",
      "start",
      2,
    );
  }
  const used: Side = side === "right" ? (fitsRight ? "right" : "left") : fitsLeft ? "left" : "right";
  const maxHeight = viewHeight - VIEWPORT_PADDING * 2;
  const height = Math.min(size.height, maxHeight);
  const x = used === "right" ? right : left;
  const y = clamp(trigger.top - SUB_ALIGN_OFFSET, VIEWPORT_PADDING, viewHeight - height - VIEWPORT_PADDING);
  const originY = clamp(trigger.top + trigger.height / 2 - y, 0, height);
  return {
    left: x,
    top: y,
    side: used,
    origin: `${used === "right" ? 0 : size.width}px ${originY}px`,
    maxHeight,
  };
}
