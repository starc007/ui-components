import { TestimonialCard } from "@/components/app/landing/testimonial-card";
import { TESTIMONIALS } from "@/components/app/landing/testimonials-data";
import { Marquee } from "@/components/motion/marquee";

export function Testimonials() {
  // Split into two rows that scroll in opposite directions.
  const mid = Math.ceil(TESTIMONIALS.length / 2);
  const rowOne = TESTIMONIALS.slice(0, mid);
  const rowTwo = TESTIMONIALS.slice(mid);

  return (
    <section className="pb-16">
      <div className="mx-auto mb-8 max-w-7xl border-t border-border px-4 pt-14">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Testimonials
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Loved by builders
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <Marquee direction="left" speed={60} gap="1rem" fade>
          {rowOne.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              compact
            />
          ))}
        </Marquee>
        <Marquee direction="right" speed={60} gap="1rem" fade>
          {rowTwo.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              compact
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
