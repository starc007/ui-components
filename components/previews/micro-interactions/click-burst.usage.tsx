"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { ClickBurst } from "@/components/motion/click-burst";

export function ClickBurstUsage() {
  const [liked, setLiked] = useState(false);

  return (
    // Bursts from the click point, only when liking.
    <ClickBurst enabled={!liked}>
      <button
        type="button"
        aria-pressed={liked}
        aria-label="Like"
        onClick={() => setLiked((value) => !value)}
        className="grid size-10 place-items-center rounded-full border border-border"
      >
        <Heart className={liked ? "size-4 fill-rose-500 text-rose-500" : "size-4"} />
      </button>
    </ClickBurst>
  );
}
