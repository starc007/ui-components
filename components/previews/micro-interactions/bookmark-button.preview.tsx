"use client";

import { useState } from "react";
import { BookmarkButton } from "@/components/motion/bookmark-button";
import { useAutoplay } from "./autoplay";

export function BookmarkButtonPreview() {
  const [saved, setSaved] = useState(false);
  const stage = useAutoplay(() => setSaved((value) => !value), 2000);

  return (
    <div {...stage}>
      <BookmarkButton sound saved={saved} onSavedChange={setSaved} />
    </div>
  );
}
