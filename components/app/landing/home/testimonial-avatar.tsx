"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * An X profile photo that falls back to initials. Saved avatar URLs die when
 * someone changes their photo, so a broken image must never show.
 */
export function TestimonialAvatar({
  src,
  name,
  className,
  fallback = "initials",
}: {
  src: string;
  name: string;
  className?: string;
  /** `none` drops a dead photo entirely, for decorative stacks of faces. */
  fallback?: "initials" | "none";
}) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter((part) => /^\p{L}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (failed) {
    if (fallback === "none") return null;
    return (
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-card text-[10px] font-medium text-muted-foreground",
          className,
        )}
      >
        {initials || "?"}
      </span>
    );
  }

  return (
    <img
      src={src.replace("_normal", "_bigger")}
      alt=""
      width={28}
      height={28}
      loading="lazy"
      onError={() => setFailed(true)}
      // An image that failed before hydration never fires onError again.
      ref={(image) => {
        if (image?.complete && image.naturalWidth === 0) setFailed(true);
      }}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}
