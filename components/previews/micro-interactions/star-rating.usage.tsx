"use client";

import { useState } from "react";
import { StarRating } from "@/components/motion/star-rating";

export function StarRatingUsage() {
  const [rating, setRating] = useState(0);
  return <StarRating value={rating} onValueChange={setRating} size={28} />;
}
