import { Marquee } from "@/components/motion/marquee";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

export type Testimonial = {
  name: string;
  handle?: string;
  avatar?: string;
  body: string;
};

export interface TestimonialsProps {
  title?: string;
  description?: string;
  items: Testimonial[];
  className?: string;
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className="mx-2 flex w-[340px] flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-5">
      <blockquote className="text-sm text-(--color-fg)">{t.body}</blockquote>
      <figcaption className="flex items-center gap-3">
        <Avatar src={t.avatar} name={t.name} size="sm" />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-(--color-fg)">{t.name}</span>
          {t.handle ? <span className="text-xs text-(--color-fg-muted)">{t.handle}</span> : null}
        </div>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ title, description, items, className }: TestimonialsProps) {
  const half = Math.ceil(items.length / 2);
  return (
    <section className={cn("py-20", className)}>
      <div className="mx-auto mb-12 max-w-2xl px-4 text-center">
        {title ? (
          <h2 className="text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">{title}</h2>
        ) : null}
        {description ? <p className="mt-3 text-(--color-fg-muted)">{description}</p> : null}
      </div>
      <div className="flex flex-col gap-4">
        <Marquee speed={40}>
          {items.slice(0, half).map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </Marquee>
        <Marquee speed={50} direction="right">
          {items.slice(half).map((t, i) => (
            <Card key={i} t={t} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
