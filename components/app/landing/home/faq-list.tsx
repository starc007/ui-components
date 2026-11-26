import { useTranslations } from "use-intl";
import { useFaqItems } from "@/components/app/landing/faq";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

/** The landing FAQ: a two-tone heading beside four questions. */
export function FaqList({ className }: { className?: string }) {
  const t = useTranslations("Landing.faq");
  const items = useFaqItems();
  return (
    <section
      aria-labelledby="landing-faq"
      // items-start: the heading keeps its own height instead of stretching
      // with the accordion, so opening a row never moves it. Sticky keeps it
      // beside the list while a long answer scrolls past.
      className={cn(
        "mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-10",
        className,
      )}
    >
      <SectionHeading
        id="landing-faq"
        title={t("title")}
        muted={t("titleMuted")}
        className="mb-0 md:sticky md:top-24"
      />
      <BouncyAccordion items={items} className="w-full" />
    </section>
  );
}
