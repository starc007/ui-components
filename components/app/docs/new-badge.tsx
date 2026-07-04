import { cn } from "@/lib/utils";

export function NewBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-(--color-border-strong) bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-accent",
        className,
      )}
    >
      New
    </span>
  );
}
