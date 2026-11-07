import { TestimonialCard } from "@/components/app/landing/testimonial-card";
import { TESTIMONIALS } from "@/components/app/landing/testimonials-data";
import { Marquee } from "@/components/motion/marquee";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./section-title";

/** Two opposing testimonial marquees under a small centered heading. */
export function TestimonialRows({ className }: { className?: string }) {
  const mid = Math.ceil(TESTIMONIALS.length / 2);

  return (
    <section aria-labelledby="landing-testimonials" className={className}>
      <SectionTitle
        id="landing-testimonials"
        label="Testimonials"
        title="Loved by builders"
        align="center"
        className="px-4"
      />
      <div className={cn("flex flex-col gap-3")}>
        <Marquee direction="left" speed={60} gap="0.75rem" fade>
          {TESTIMONIALS.slice(0, mid).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} compact />
          ))}
        </Marquee>
        <Marquee direction="right" speed={60} gap="0.75rem" fade>
          {TESTIMONIALS.slice(mid).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} compact />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
