"use client";

import { SkeletonLoader } from "@/components/motion/skeleton-loader";

export function SkeletonLoaderPreview() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <SkeletonLoader circle width={44} height={44} />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLoader width="48%" height={14} />
          <SkeletonLoader width="32%" height={12} className="rounded-full" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <SkeletonLoader width="100%" height={12} />
        <SkeletonLoader width="92%" height={12} />
        <SkeletonLoader width="74%" height={12} />
      </div>

      <div className="mt-5 flex gap-2">
        <SkeletonLoader width={88} height={32} className="rounded-full" />
        <SkeletonLoader width={72} height={32} className="rounded-full" />
      </div>
    </div>
  );
}
