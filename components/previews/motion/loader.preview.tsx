"use client";

import { Loader, type LoaderVariant } from "@/components/motion/loader";

const VARIANTS: { variant: LoaderVariant; label: string }[] = [
  { variant: "spinner", label: "Spinner" },
  { variant: "dots", label: "Dots" },
  { variant: "bars", label: "Bars" },
  { variant: "dot-matrix", label: "Dot Matrix" },
  { variant: "dither", label: "Dither" },
  { variant: "morph", label: "Morph" },
  { variant: "comet", label: "Comet" },
  { variant: "metaballs", label: "Metaballs" },
  { variant: "newton", label: "Newton" },
  { variant: "helix", label: "Helix" },
  { variant: "scramble", label: "Scramble" },
  { variant: "percent", label: "Percent" },
  { variant: "ascii", label: "ASCII" },
  { variant: "ascii-line", label: "ASCII Line" },
  { variant: "ascii-braille", label: "ASCII Braille" },
  { variant: "ascii-blocks", label: "ASCII Blocks" },
  { variant: "ascii-bounce", label: "ASCII Bounce" },
];

export function LoaderPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 p-8">
      {VARIANTS.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col items-center gap-4">
          <Loader variant={variant} size={36} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
