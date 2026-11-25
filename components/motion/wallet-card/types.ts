import type { ReactNode } from "react";

export type WalletAccount = {
  id: string;
  name: string;
  address: string;
  avatar?: ReactNode;
};

export interface WalletCardProps {
  /** Accounts listed in the switcher. */
  accounts: WalletAccount[];
  /** The active account id, for controlled use. */
  accountId?: string;
  /** The initial account id when uncontrolled. Defaults to the first account. */
  defaultAccountId?: string;
  /** Called with the account id when the user picks an account. */
  onAccountChange?: (id: string) => void;
  /** Balance amount, shown with 2 decimals. */
  balance: number;
  /** Text placed before the balance and change amounts. Default: "$" */
  balancePrefix?: string;
  /** Initial balance change shown in the pill before any live change. */
  defaultChange?: number;
  /** Start with the balance hidden behind dots. */
  defaultBalanceHidden?: boolean;
  /** Called when the Send action is pressed. */
  onSend?: () => void;
  /** Called when the Deposit action is pressed. */
  onDeposit?: () => void;
  /** Called when the Swap action is pressed. */
  onSwap?: () => void;
  /** Called when the Buy action is pressed. */
  onBuy?: () => void;
  /** Placeholder for the search input. Defaults to the `searchPlaceholder` label. */
  searchPlaceholder?: string;
  /** Recent searches shown in the expanded search panel. */
  searchRecent?: string[];
  /** Called with the search text as the user types or picks a recent search. */
  onSearchChange?: (value: string) => void;
  /** Called with the trimmed query on Enter, or with a picked recent search. */
  onSearchSubmit?: (value: string) => void;
  /** Show an unread pulse on the notifications bell. */
  hasNotifications?: boolean;
  /** Called when the notifications bell is pressed. */
  onNotifications?: () => void;
  /** Classes merged onto the root element. */
  className?: string;
}
