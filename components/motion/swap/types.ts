export type Chain = {
  /** Unique key that tokens point to through `chainId`. */
  id: string;
  /** Chain name shown in the picker filters and under each field. */
  name: string;
  /** Tailwind background and text classes for the chain's dot. */
  tone: string;
  /** Short glyph shown inside the chain's dot. */
  symbol: string;
};

export type Token = {
  /** Unique key used to select the token. */
  id: string;
  /** Ticker shown on the field button, rate and token rows. */
  symbol: string;
  /** Full name shown in the picker list and matched by search. */
  name: string;
  /** `id` of the chain the token lives on. */
  chainId: string;
  /** Contract address shown in the picker row instead of the balance; matched by search. */
  address?: string;
  /** Wallet balance; fills the Max button and flags amounts above it. */
  balance?: number;
  /** Price of 1 token in US dollars, for the fiat value and rate. */
  usd?: number;
  /** Marks a trending token for your own data; the components do not read it. */
  trending?: boolean;
  /** Lists the token in the picker's Popular row, which shows the first 6. */
  popular?: boolean;
};

export type TokenSide = "from" | "to";
