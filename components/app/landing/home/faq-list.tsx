import { useTranslations } from "use-intl";
import { useFaqItems } from "@/components/app/landing/faq";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { cn } from "@/lib/utils";
import { SectionTitle } from "./section-title";

/** The landing FAQ beside a small heading instead of above a large one. */
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
        "mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-start gap-6 px-4 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-8",
        className,
      )}
    >
      <SectionTitle
        id="landing-faq"
        label={t("eyebrow")}
        title={t("title")}
        className="mb-0 md:sticky md:top-24"
      />
      <BouncyAccordion items={items} className="w-full" />
    </section>
  );
}
