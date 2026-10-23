import { encode } from "uqr";
import { cn } from "@/lib/utils";

/**
 * A QR code drawn as one SVG path on the server, in the current text color.
 * Phone cameras need dark modules on a light field, so the code always sits
 * on a white tile, in dark mode too.
 */
export function QrCode({
  value,
  label,
  className,
}: {
  value: string;
  /** What scanning does, for screen readers. */
  label: string;
  className?: string;
}) {
  const { data, size } = encode(value, { ecc: "M", border: 0 });
  let path = "";
  data.forEach((row, y) => {
    row.forEach((dark, x) => {
      if (dark) path += `M${x} ${y}h1v1h-1z`;
    });
  });

  return (
    <div className={cn("rounded-xl bg-white p-3 text-black ring-1 ring-black/10 dark:ring-0", className)}>
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${size} ${size}`}
        shapeRendering="crispEdges"
        className="block h-full w-full"
      >
        <path d={path} fill="currentColor" />
      </svg>
    </div>
  );
}
