"use client";

import {
  PredictionMarketCard,
  type PredictionMarketCardSelection,
} from "@/components/motion/prediction-market-card";

export function PredictionMarketCardUsage({
  onTrade,
}: {
  onTrade: (selection: PredictionMarketCardSelection) => void;
}) {
  return (
    <PredictionMarketCard
      title="Boston Celtics vs. Los Angeles Lakers"
      category="Basketball"
      status="Sunday · 7:30 PM"
      volume="$2.4M"
      volumeHistory={[12, 18, 15, 26, 20, 32, 29, 38]}
      outcomes={[
        { id: "celtics", label: "Celtics", probability: 0.51, color: "#34d399" },
        { id: "lakers", label: "Lakers", probability: 0.49, color: "#fbbf24" },
      ]}
      onOutcomeClick={onTrade}
    />
  );
}
