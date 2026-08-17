import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";

export function ChromaticTextRevealPreview() {
  return (
    // The sentence never wraps, so it has to be sized against the space it
    // actually gets — the surrounding column, not the viewport.
    <div className="@container flex w-full justify-center">
      <ChromaticTextReveal
        prefix="Motion that feels"
        words={["natural.", "intentional.", "alive."]}
        startOnView={false}
        className="shrink-0 font-medium tracking-[-0.04em] text-foreground [font-size:clamp(1.25rem,7.8cqw,3rem)]"
      />
    </div>
  );
}
