import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";

export function ChromaticTextRevealPreview() {
  return (
    <ChromaticTextReveal
      prefix="Motion that feels"
      words={["natural.", "intentional.", "alive."]}
      startOnView={false}
      className="shrink-0 text-4xl font-medium tracking-[-0.04em] text-foreground sm:text-5xl"
    />
  );
}
