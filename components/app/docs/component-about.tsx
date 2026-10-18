import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/components/motion/collapsible";
import type { ComponentAbout as ComponentAboutData } from "@/lib/component-about";

/**
 * Collapsed long-form notes at the end of a component page. The disclosure
 * keeps its content mounted while closed, so the text is in the
 * server-rendered markup without taking room in the layout.
 */
export function ComponentAbout({
  name,
  about,
}: {
  name: string;
  about: ComponentAboutData;
}) {
  return (
    <section id="about" className="mt-12 scroll-mt-24 border-t border-border pt-6">
      <Collapsible>
        <h2 className="text-sm font-semibold text-foreground">
          <CollapsibleTrigger className="-mx-3 w-[calc(100%+1.5rem)]">
            About {name}
            <CollapsibleIndicator />
          </CollapsibleTrigger>
        </h2>
        <CollapsibleContent contentClassName="pt-3 text-sm leading-6 text-muted-foreground">
          <p>{about.overview}</p>

          <h3 className="mt-6 font-medium text-foreground">When to use it</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {about.useWhen.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3 className="mt-6 font-medium text-foreground">Accessibility</h3>
          <p className="mt-2">{about.accessibility}</p>

          <h3 className="mt-6 font-medium text-foreground">FAQ</h3>
          <dl className="mt-2 space-y-4">
            {about.faq.map((item) => (
              <div key={item.question}>
                <dt className="font-medium text-foreground">{item.question}</dt>
                <dd className="mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
