"use client";

import {
  PriceTargetFan,
  PriceTargetFanHeader,
  PriceTargetFanPlot,
  PriceTargetFanSvg,
  PriceTargetFanAxes,
  PriceTargetFanHistory,
  PriceTargetFanTargets,
  PriceTargetFanNow,
  PriceTargetFanCursor,
  PriceTargetFanTooltip,
} from "@/components/charts/price-target-fan";

// Illustrative prices. Replace these dated samples with your own API response.
const history = [
  { date: "2025-09-14", price: 158.4 },
  { date: "2025-10-14", price: 164.2 },
  { date: "2025-11-14", price: 160.8 },
  { date: "2025-12-14", price: 173.1 },
  { date: "2026-01-14", price: 170.6 },
  { date: "2026-02-14", price: 181.3 },
  { date: "2026-03-14", price: 175.8 },
  { date: "2026-04-14", price: 183.7 },
  { date: "2026-05-14", price: 178.2 },
  { date: "2026-06-14", price: 184.1 },
  { date: "2026-07-14", price: 180.5 },
  { date: "2026-08-14", price: 177.3 },
  { date: "2026-09-14", price: 178.52 },
];

export function PriceTargetFanPreview() {
  return (
    <PriceTargetFan
      current={178.52}
      history={history}
      targets={[
        { key: "High", price: 232, analysts: 9 },
        { key: "Mean", price: 205, analysts: 34 },
        { key: "Low", price: 168, analysts: 6 },
      ]}
      dates={{ horizon: "Sep 2027" }}
    >
      <PriceTargetFanHeader />
      <PriceTargetFanPlot>
        <PriceTargetFanSvg>
          <PriceTargetFanAxes />
          <PriceTargetFanHistory />
          <PriceTargetFanTargets />
          <PriceTargetFanNow />
          <PriceTargetFanCursor />
        </PriceTargetFanSvg>
        <PriceTargetFanTooltip />
      </PriceTargetFanPlot>
    </PriceTargetFan>
  );
}
