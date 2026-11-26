"use client";

import { useState } from "react";
import { UpvoteButton } from "@/components/motion/upvote-button";
import { useAutoplay } from "./autoplay";

export function UpvoteButtonPreview() {
  const [voted, setVoted] = useState(false);
  const stage = useAutoplay(() => setVoted((value) => !value), 2200);

  return (
    <div {...stage}>
      <UpvoteButton sound count={482} voted={voted} onVotedChange={setVoted} />
    </div>
  );
}
