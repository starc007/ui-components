"use client";

import {
  Treemap,
  TreemapLegend,
  TreemapPlot,
  TreemapTooltip,
  type TreemapNode,
} from "@/components/charts/treemap";

/** Supply leaves with values, or groups with children. Keep IDs stable to
 * morph their tiles when values change. Group totals are derived from leaves. */
export function TreemapExample({ data }: { data: readonly TreemapNode[] }) {
  return (
    <Treemap
      data={data}
      label="Portfolio allocation"
      formatValue={(value) => `$${value.toLocaleString("en-US")}`}
    >
      <TreemapPlot className="h-80" />
      <TreemapTooltip />
      <TreemapLegend showValues />
    </Treemap>
  );
}
