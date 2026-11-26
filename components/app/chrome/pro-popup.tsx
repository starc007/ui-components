"use client";

import { ArrowUpRight, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { blackFriday, blackFridayPrice, blackFridayProUrl, formatUsd, useBlackFridayLive } from "@/components/app/black-friday";
import { PRO_BUNDLE_PRICE_USD } from "@/components/app/docs/pro-card";
import { ProCta } from "@/components/app/pro-cta";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_IN, EASE_OUT } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { usePathname } from "@/lib/navigation";
import { PresenceGate } from "@/lib/presence-gate";

const PRO_URL =
  "https://pro.beui.dev/?utm_source=beui&utm_medium=referral&utm_campaign=free_to_pro&utm_content=popup";

// Real Pro blocks, as pro.beui.dev shows them, fanned like cards. `x` and
// `rotate` place each card at rest; `spread` is how far hover fans it out.
const SHOWCASE = [
  { src: "https://pro.beui.dev/showcase/blocks/pricing.webp", x: -46, rotate: -8, spread: -8 },
  { src: "https://pro.beui.dev/showcase/blocks/testimonials.webp", x: 46, rotate: 8, spread: 8 },
  { src: "https://pro.beui.dev/showcase/blocks/hero-sections.webp", x: 0, rotate: 0, spread: 0 },
] as const;

// It waits for real interest: a few seconds into the visitor's third page of
// a visit, never on the page they landed on. Closing it, or following it to
// Pro, keeps it away for a month.
const PAGES_BEFORE = 3;
const DELAY_MS = 8000;
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
/** localStorage: the time (ms) before which the popup stays hidden. */
const SNOOZE_KEY = "beui-pro-popup";
/** sessionStorage: pages seen in this visit. */
const PAGES_KEY = "beui-pages-seen";

// Storage can be blocked (private windows, strict settings); the popup then
// simply never shows rather than showing on every page.
function read(store: "local" | "session", key: string) {
  try {
    return (store === "local" ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}
function write(store: "local" | "session", key: string, value: string) {
  try {
    (store === "local" ? window.localStorage : window.sessionStorage).setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/** Three Pro blocks fanned on a soft stage. They rise in on open and spread on hover. */
function Showcase({ still, spread }: { still: boolean; spread: boolean }) {
  return (
    <div className="absolute inset-x-0 -bottom-[12%] flex justify-center">
      {SHOWCASE.map((card, index) => (
        <motion.img
          key={card.src}
          src={card.src}
          alt=""
          width={593}
          height={440}
          decoding="async"
          draggable={false}
          initial={still ? false : { opacity: 0, y: 40, rotate: 0, x: `${card.x * 0.4}%` }}
          animate={{
            opacity: 1,
            y: spread && card.spread === 0 ? -6 : 0,
            rotate: card.rotate + (spread ? card.spread / 2 : 0),
            x: `${card.x + (spread ? card.spread * 1.6 : 0)}%`,
          }}
          transition={{
            duration: still ? 0 : 0.5,
            ease: EASE_OUT,
            delay: spread ? 0 : 0.12 + index * 0.06,
          }}
          className="absolute bottom-0 w-[46%] origin-bottom rounded-md border border-border bg-white object-cover object-top select-none"
          style={{ aspectRatio: "593 / 440" }}
        />
      ))}
    </div>
  );
}

/**
 * A small card in the bottom-right corner telling a returning visitor about
 * beUI Pro: three real Pro blocks fanned on a stage, what is in it, the price
 * (the sale price while it runs), and the Pro button. Non-modal: it never
 * takes focus, Escape closes it, and the page stays usable around it.
 */
export function ProPopup() {
  const t = useTranslations("Chrome.proPopup");
  const pathname = usePathname();
  const still = useReducedMotion() ?? false;
  const canHover = useHoverCapable();
  const onSale = useBlackFridayLive();
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Count pages in this visit; on the third, wait a moment, then show.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-runs once per page, so the path is the trigger.
  useEffect(() => {
    if (Number(read("local", SNOOZE_KEY) ?? 0) > Date.now()) return;
    const seen = Number(read("session", PAGES_KEY) ?? 0) + 1;
    if (!write("session", PAGES_KEY, String(seen)) || seen < PAGES_BEFORE) return;
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  const close = () => {
    write("local", SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    setOpen(false);
  };

  useDismiss(open, close, panel, { outsidePress: false });

  const price = onSale ? blackFridayPrice(PRO_BUNDLE_PRICE_USD) : PRO_BUNDLE_PRICE_USD;

  return (
    <AnimatePresence>
      {open ? (
        <PresenceGate key="pro">
          {({ gate }) => (
            <motion.div
              ref={panel}
              {...gate}
              role="dialog"
              aria-modal="false"
              aria-labelledby="pro-popup-title"
              aria-describedby="pro-popup-body"
              initial={{ opacity: 0, y: still ? 0 : 16 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_OUT } }}
              exit={{ opacity: 0, y: still ? 0 : 10, transition: { duration: 0.18, ease: EASE_IN } }}
              onHoverStart={() => canHover && !still && setSpread(true)}
              onHoverEnd={() => setSpread(false)}
              className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-background p-2 text-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[22rem]"
            >
              {/* The stage: real Pro blocks, decorative. */}
              <div
                aria-hidden="true"
                className="relative h-36 overflow-hidden rounded-lg border border-border/60 bg-linear-to-b from-[color-mix(in_oklab,var(--foreground)_6%,var(--background))] to-[color-mix(in_oklab,var(--foreground)_2%,var(--background))]"
              >
                <Showcase still={still} spread={spread} />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <span className="rounded-full border border-border bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur-sm">
                    {t("badge")}
                  </span>
                  {onSale ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                      {t("saleBadge", { percent: blackFriday.percent })}
                    </span>
                  ) : null}
                </div>
              </div>

              <Tooltip content={t("close")} side="top">
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("close")}
                  className="absolute top-3.5 right-3.5 grid size-7 place-items-center rounded-full border border-border bg-background/85 text-muted-foreground outline-none backdrop-blur-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" className="size-3.5" />
                </button>
              </Tooltip>

              <div className="px-2 pt-3.5 pb-3">
                <h2 id="pro-popup-title" className="text-base font-medium tracking-tight">
                  {t("title")}
                </h2>
                <p id="pro-popup-body" className="mt-1 text-sm leading-5 text-pretty text-muted-foreground">
                  {t("body")}
                </p>
              </div>

              <div className="flex items-end justify-between gap-3 px-2 pb-1">
                <div className="min-w-0">
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-lg font-medium tracking-tight tabular-nums">{formatUsd(price)}</span>
                    {onSale ? (
                      <del className="text-xs text-muted-foreground tabular-nums">{formatUsd(PRO_BUNDLE_PRICE_USD)}</del>
                    ) : null}
                    <span className="text-xs text-muted-foreground">{t("lifetime")}</span>
                  </p>
                  {onSale ? (
                    <p className="text-xs text-muted-foreground">{t("saleEnds", { end: blackFriday.endLabel })}</p>
                  ) : null}
                </div>
                <ProCta
                  href={onSale ? blackFridayProUrl("popup") : PRO_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={close}
                  className="min-h-9 shrink-0"
                >
                  {t("cta")}
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  <span className="sr-only"> {t("opensInNewTab")}</span>
                </ProCta>
              </div>
            </motion.div>
          )}
        </PresenceGate>
      ) : null}
    </AnimatePresence>
  );
}
