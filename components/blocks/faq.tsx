import { Accordion, type AccordionItem } from "@/components/ui/accordion";
import { cn } from "@/lib/cn";

export interface FaqProps {
  title?: string;
  description?: string;
  items: AccordionItem[];
  className?: string;
}

export function Faq({
  title = "Frequently asked",
  description,
  items,
  className,
}: FaqProps) {
  return (
    <section className={cn("px-4 py-20", className)}>
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[1fr_2fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-(--color-fg) md:text-4xl">{title}</h2>
          {description ? <p className="mt-3 text-(--color-fg-muted)">{description}</p> : null}
        </div>
        <Accordion items={items} />
      </div>
    </section>
  );
}
