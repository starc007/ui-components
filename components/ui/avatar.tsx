"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

export type AvatarSize = keyof typeof sizeMap;

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size"> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export function Avatar({ src, alt, name, size = "md", className, ...props }: AvatarProps) {
  const [err, setErr] = useState(false);
  const showImage = src && !err;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg-elev) font-medium text-(--color-fg)",
        sizeMap[size],
        className,
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? ""}
          onError={() => setErr(true)}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}

export function AvatarGroup({
  children,
  max,
  size = "md",
  className,
}: {
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}) {
  const items = Array.isArray(children) ? children : [children];
  const visible = max ? items.slice(0, max) : items;
  const overflow = max ? items.length - max : 0;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((child, i) => (
        <div key={i} className="ring-2 ring-(--color-bg) rounded-full">
          {child}
        </div>
      ))}
      {overflow > 0 ? (
        <Avatar size={size} name={`+${overflow}`} className="ring-2 ring-(--color-bg)" />
      ) : null}
    </div>
  );
}
