"use client";

import { useState } from "react";
import {
  PredictionMarket,
  type PredictionMarketOrderValue,
} from "@/components/motion/prediction-market";

const outcomes = [
  {
    id: "yes",
    label: "Yes",
    price: 0.167,
  },
  {
    id: "no",
    label: "No",
    price: 0.834,
  },
];

export function PredictionMarketPreview() {
  const [order, setOrder] = useState<PredictionMarketOrderValue>({
    mode: "buy",
    outcomeId: "yes",
    amount: "115",
  });

  return (
    <div className="flex w-full items-center justify-center">
      <PredictionMarket
        outcomes={outcomes}
        value={order}
        onValueChange={setOrder}
        balance={500}
        positions={{ yes: 125, no: 48 }}
        quickAmounts={[1, 5, 10, 100]}
      />
    </div>
  );
}
