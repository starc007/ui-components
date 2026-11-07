import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Small section heading: a mono label, a 28px title and an optional link. */
export function SectionTitle({
  id,
  label,
  title,
  link,
  align = "start",
  className,
}: {
  id?: string;
  label: string;
  title: string;
  link?: { href: string; label: string };
  align?: "start" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3",
        align === "center"
          ? "items-center text-center"
          : "sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <h2
          id={id}
          className="mt-2 text-balance text-2xl font-medium tracking-tight text-foreground md:text-[1.75rem] md:leading-tight"
        >
          {title}
        </h2>
      </div>
      {link ? (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : null}
    </div>
  );
}
