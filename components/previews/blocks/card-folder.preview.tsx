"use client";

import { CardFolder } from "@/components/motion/card-folder";

const CONTOUR_RADII = Array.from({ length: 18 }, (_, index) => 72 + index * 24);
function CardArtwork() {
  return (
    <span className="relative block h-full w-full overflow-hidden bg-[linear-gradient(135deg,#383a38_0%,#202120_48%,#111211_100%)] text-white">
      <svg
        aria-hidden="true"
        viewBox="0 0 640 404"
        className="absolute inset-0 h-full w-full"
      >
        {CONTOUR_RADII.map((radius, index) => (
          <circle
            // The concentric contours deliberately begin outside the card so
            // their cropped curves read like the reference artwork.
            key={radius}
            cx="-20"
            cy="-28"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.72 - index * 0.025}
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <span className="absolute inset-0 bg-[radial-gradient(circle_at_78%_8%,rgb(255_255_255/0.11),transparent_32%)]" />

      <span className="absolute left-[6%] top-[8%] flex items-center gap-2 text-[clamp(0.8rem,3vw,1.4rem)] font-semibold tracking-[-0.04em]">
        beUI <span className="block size-2.5 rotate-45 rounded-[2px] bg-white/85" />
      </span>

      <span className="absolute bottom-[9%] right-[7%] h-[23%] w-[15%] overflow-hidden rounded-[18%] bg-[linear-gradient(135deg,#f2f0ea_0%,#b9b7b1_45%,#e4e1d9_100%)] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.32),0_2px_8px_rgb(0_0_0/0.25)]">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/30" />
        <span className="absolute inset-x-0 top-1/3 h-px bg-black/30" />
        <span className="absolute inset-x-0 bottom-1/3 h-px bg-black/30" />
        <span className="absolute left-0 top-1/2 h-[34%] w-[28%] -translate-y-1/2 rounded-r-[35%] border border-l-0 border-black/30" />
        <span className="absolute right-0 top-1/2 h-[34%] w-[28%] -translate-y-1/2 rounded-l-[35%] border border-r-0 border-black/30" />
      </span>

      <span className="absolute bottom-[10%] left-[6%] flex flex-col gap-1.5">
        <span className="text-[clamp(0.45rem,1.4vw,0.65rem)] uppercase tracking-[0.22em] text-white/45">
          Studio card
        </span>
        <span className="font-mono text-[clamp(0.65rem,2vw,0.9rem)] tracking-[0.18em] text-white/80">
          •••• 0806
        </span>
      </span>
    </span>
  );
}

export function CardFolderPreview() {
  return (
    <div className="flex min-h-80 w-full items-center justify-center px-5 py-10 sm:px-10">
      <CardFolder
        title="Studio card (•••• 0806)"
        description="Auto-matching funds"
        card={<CardArtwork />}
        onAction={() => {}}
      />
    </div>
  );
}
