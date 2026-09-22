import { TestimonialCard } from "@/components/app/landing/testimonial-card";
import { TESTIMONIALS } from "@/components/app/landing/testimonials-data";
import { Marquee } from "@/components/motion/marquee";

export function Testimonials() {
  // Split into two rows that scroll in opposite directions.
  const mid = Math.ceil(TESTIMONIALS.length / 2);
  const rowOne = TESTIMONIALS.slice(0, mid);
  const rowTwo = TESTIMONIALS.slice(mid);

  return (
    <section aria-labelledby="landing-testimonials" className="pt-24 pb-4 sm:pt-32 sm:pb-8">
      <div className="mx-auto mb-10 max-w-2xl px-4 text-center">
        <p className="text-sm text-muted-foreground">Testimonials</p>
        <h2
          id="landing-testimonials"
          className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-foreground md:text-4xl"
        >
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
