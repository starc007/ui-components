import { cn } from "@/lib/utils";

export const COUNT_CLASS =
  "inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground/[0.06] px-1 text-[11px] leading-none font-medium tabular-nums text-muted-foreground";

export const GROUP_LABEL =
  "mb-1.5 flex items-center gap-2 rounded-full px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground";

export function linkClass(active: boolean) {
  return cn(
    "relative block rounded-full px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:py-1",
    active
      ? "text-foreground font-medium bg-foreground/[0.06]"
      : "text-muted-foreground hover:text-foreground",
  );
}

/**
 * A variant row under a split page. A dashed guide runs down the left of the
 * group in gray, a little inside the parent's label, and every row hooks off
 * it. The line from the top down to the active row, and that row's hook, are
 * drawn in the primary color. The guide stops at the last row's hook.
 * Pseudo-elements on the link span the full row and sit outside the hover
 * pill.
 */
export function variantLinkClass(position: "above" | "active" | "below", last: boolean) {
  return cn(
    "relative ml-7 block rounded-full px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:py-1",
    // The guide: a 1px bar masked into fixed 3px dashes. A dashed border
    // stretches its dashes to fit each element, so two of them never line up.
    "before:pointer-events-none before:absolute before:top-0 before:-left-2 before:w-px before:[mask-image:repeating-linear-gradient(to_bottom,#000_0_3px,transparent_3px_6px)]",
    // On the last row the guide stops where the arc starts to curve.
    last ? "before:bottom-[calc(50%+0.5rem)]" : "before:bottom-0",
    (position === "above" || (position === "active" && last)) && "before:bg-primary",
    position === "below" && "before:bg-foreground/20",
    // The active row's guide is dark down to its arc and gray below it.
    position === "active" &&
      !last &&
      "before:bg-[linear-gradient(to_bottom,var(--color-primary)_50%,color-mix(in_oklab,var(--color-foreground)_20%,transparent)_50%)]",
    // The arc: just the curve into the row, so it barely overlaps the guide.
    "after:pointer-events-none after:absolute after:top-[calc(50%-0.5rem)] after:-left-2 after:h-2 after:w-4 after:rounded-bl-lg after:border-b after:border-l after:border-dashed",
    position === "active"
      ? "text-foreground font-medium after:border-primary"
      : "text-muted-foreground hover:text-foreground after:border-foreground/20",
  );
}
