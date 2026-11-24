import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A landing section heading in two tones: a short lead in the foreground
 * color and its continuation muted, with an optional action on the right.
 */
export function SectionHeading({
  id,
  title,
  muted,
  action,
  className,
}: {
  id: string;
  title: string;
  muted: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <h2
        id={id}
        className="max-w-lg text-balance text-2xl font-medium tracking-tight md:text-[1.75rem] md:leading-tight"
      >
        <span className="text-foreground">{title}</span>{" "}
        <span className="text-muted-foreground">{muted}</span>
      </h2>
      {action ? <div className="shrink-0 self-start sm:self-auto">{action}</div> : null}
    </div>
  );
}
