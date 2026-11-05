/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const priceTargetFanMessages = {
  label: "Price target · 12 months",
  chart: "{label}: mean {mean}, now {current}",
  target: "{key} target",
  targetButton: "{key} target {price}, {analysts} analysts",
  history: "Price history",
  price: "Price",
  analysts: "Analysts",
  vsNow: "vs now",
  now: "Now",
  horizon: "Target",
};

export type PriceTargetFanMessages = typeof priceTargetFanMessages;
