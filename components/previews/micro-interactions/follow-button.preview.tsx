"use client";

import { useState } from "react";
import { FollowButton } from "@/components/motion/follow-button";
import { useAutoplay } from "./autoplay";

export function FollowButtonPreview() {
  const [following, setFollowing] = useState(false);
  // Long enough for the spinner, the check and the open to play out.
  const stage = useAutoplay(() => setFollowing((value) => !value), 2800);

  return (
    <div {...stage}>
      <FollowButton following={following} onFollowingChange={setFollowing} />
    </div>
  );
}
