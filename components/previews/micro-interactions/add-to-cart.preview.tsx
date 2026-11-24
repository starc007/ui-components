"use client";

import { useState } from "react";
import { AddToCart } from "@/components/motion/add-to-cart";
import { useAutoplay } from "./autoplay";

// Into the cart, up to three, and back out again.
const SEQUENCE = [1, 2, 3, 2, 1, 0];

export function AddToCartPreview() {
  const [step, setStep] = useState(-1);
  const stage = useAutoplay(() => setStep((value) => (value + 1) % SEQUENCE.length), 1400);
  const quantity = step < 0 ? 0 : SEQUENCE[step];

  return (
    <div {...stage}>
      <AddToCart
        sound
        quantity={quantity}
        onQuantityChange={(next) => {
          // A click hands control back to the closest step in the loop.
          const index = SEQUENCE.indexOf(next);
          setStep(index === -1 ? step : index);
        }}
      />
    </div>
  );
}
