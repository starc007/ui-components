"use client";

import { useState } from "react";
import { StarRating } from "@/components/motion/star-rating";
import { useAutoplay } from "./autoplay";

// Up and down the row, so both the fill wave and the drain show.
const SEQUENCE = [4, 2, 5, 3, 1];

export function StarRatingPreview() {
  const [rating, setRating] = useState(0);
  const stage = useAutoplay(
    () => setRating((value) => SEQUENCE[(SEQUENCE.indexOf(value) + 1) % SEQUENCE.length]),
    1800,
  );

  return (
    <div {...stage}>
      <StarRating sound value={rating} onValueChange={setRating} size={28} />
    </div>
  );
}
