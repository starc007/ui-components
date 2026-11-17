import { useTranslations } from "use-intl";
import { blackFriday, blackFridayPrice, formatUsd } from "@/components/app/black-friday";

/** The Black Friday price line on the sidebar Pro cards: was, now, and the end date. */
export function ProSalePrice({ dollars }: { dollars: number }) {
  const t = useTranslations("Docs.proSale");
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-2 text-xs leading-5 text-muted-foreground">
      <span className="font-medium text-foreground">
        {t.rich("price", {
          was: formatUsd(dollars),
          price: formatUsd(blackFridayPrice(dollars)),
          del: (chunks) => <del className="font-normal text-muted-foreground">{chunks}</del>,
        })}
      </span>
      <span>{t("ends", { end: blackFriday.endLabel })}</span>
    </p>
  );
}
