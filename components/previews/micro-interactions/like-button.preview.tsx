"use client";

import { useState } from "react";
import { LikeButton } from "@/components/motion/like-button";
import { useAutoplay } from "./autoplay";

export function LikeButtonPreview() {
  const [liked, setLiked] = useState(false);
  const stage = useAutoplay(() => setLiked((value) => !value), 2000);

  return (
    <div {...stage}>
      <LikeButton sound count={128} liked={liked} onLikedChange={setLiked} />
    </div>
  );
}
