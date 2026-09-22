import type { ReactNode } from "react";

export type WalletAccount = {
  id: string;
  name: string;
  address: string;
  avatar?: ReactNode;
};

export interface WalletCardProps {
  accounts: WalletAccount[];
  /**
   * BCP 47 tag for balance formatting. Fixed rather than the runtime locale so
   * server and client render the same text. Default "en-US".
   */
  locale?: string;
  accountId?: string;
  defaultAccountId?: string;
  onAccountChange?: (id: string) => void;
  balance: number;
  balancePrefix?: string;
  /** Initial balance change shown in the pill before any live change. */
  defaultChange?: number;
  /** Start with the balance hidden behind dots. */
  defaultBalanceHidden?: boolean;
  onSend?: () => void;
  onDeposit?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
  searchPlaceholder?: string;
  /** Recent searches shown in the expanded search panel. */
  searchRecent?: string[];
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  /** Show an unread pulse on the notifications bell. */
  hasNotifications?: boolean;
  onNotifications?: () => void;
  className?: string;
}
