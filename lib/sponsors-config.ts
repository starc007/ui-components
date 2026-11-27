/**
 * Public sponsorship settings. Every page is prerendered, so these are build
 * constants rather than runtime env. Leave a value undefined to hide it: a
 * missing address hides its crypto row, and a missing checkout URL makes the
 * plan's button request a link by email instead.
 */
export type SponsorTier = "diamond" | "platinum" | "silver";

const checkoutRedirect = "redirect_url=https://beui.dev%2Fsponsors%3Fsuccess%3Dtrue";

export const SPONSOR_CHECKOUT_URLS: Record<SponsorTier, string | undefined> = {
  diamond: `https://checkout.dodopayments.com/buy/pdt_0NjfWc1mYtqayFzorIQKM?quantity=1&${checkoutRedirect}`,
  platinum: `https://checkout.dodopayments.com/buy/pdt_0NjfXJY6XGFquMvEKPm1C?quantity=1&${checkoutRedirect}`,
  silver: `https://checkout.dodopayments.com/buy/pdt_0NjfXT8ydYuSDEYAFAtMK?quantity=1&${checkoutRedirect}`,
};

export const GITHUB_SPONSORS_URL = "https://github.com/sponsors/starc007";

/** Monthly price and slot count per tier, shown on /sponsors and in its Markdown. */
export const SPONSOR_PLANS: Record<SponsorTier, { price: string; slots: number }> = {
  diamond: { price: "$199", slots: 3 },
  platinum: { price: "$99", slots: 2 },
  silver: { price: "$49", slots: 2 },
};

export type DiamondSponsor = {
  name: string;
  /** Key under Pages.sponsors.sponsorTaglines. */
  tagline: "tracwell" | "illos";
  domain: string;
  /** Icon basename in /public/sponsors, with -light and -dark variants. */
  icon: string;
};

export const DIAMOND_SPONSORS: DiamondSponsor[] = [
  { name: "Tracwell", tagline: "tracwell", domain: "tracwell.app", icon: "tracwell-icon" },
  { name: "Illos", tagline: "illos", domain: "illos.dev", icon: "illos-icon" },
];

export const SPONSOR_EVM_ADDRESS: string | undefined = "0xD740387440012782E6D760b86B21b17b8d1166B5";
export const SPONSOR_SOL_ADDRESS: string | undefined = "A8ideoypKq2XNdKdFiGxheRmrWvPrEPxj14GDkehCAj6";
