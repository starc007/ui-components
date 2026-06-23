import { cn } from "@/lib/utils";

export interface SkeletonLoaderProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  shimmer?: boolean;
}

export function SkeletonLoader({
  className,
  width,
  height = 16,
  circle = false,
  shimmer = true,
}: SkeletonLoaderProps) {
  return (
    <>
      <style>
        {`@keyframes beui-skeleton-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}
      </style>
      <span
        aria-hidden
        className={cn(
          "block shrink-0 bg-muted",
          circle ? "rounded-full" : "rounded-xl",
          shimmer &&
            "bg-[length:200%_100%] bg-[linear-gradient(110deg,var(--muted)_30%,var(--card)_50%,var(--muted)_70%)]",
          className,
        )}
        style={{
          width,
          height,
          animation: shimmer ? "beui-skeleton-shimmer 1.5s linear infinite" : undefined,
        }}
      />
    </>
  );
}
