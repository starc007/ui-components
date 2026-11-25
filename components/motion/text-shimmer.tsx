import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";
import {
  TEXT_SHIMMER_CLASS_NAME,
  TEXT_SHIMMER_KEYFRAMES,
  textShimmerStyle,
} from "@/lib/text-shimmer";

export interface TextShimmerProps {
  children: ReactNode;
  /** Element to render the text as. Default: "span" */
  as?: ElementType;
  /** Length of one shimmer sweep (s). Default: 2.5 */
  duration?: number;
  /** Classes merged onto the text element. */
  className?: string;
}

export function TextShimmer({ children, as: Comp = "span", duration = 2.5, className }: TextShimmerProps) {
  return (
    <>
      <style>
        {TEXT_SHIMMER_KEYFRAMES}
      </style>
      <Comp
        style={textShimmerStyle(duration)}
        className={cn(
          "inline-block",
          TEXT_SHIMMER_CLASS_NAME,
          className,
        )}
      >
        {children}
      </Comp>
    </>
  );
}
