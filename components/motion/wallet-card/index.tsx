"use client";

import { Bell, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { ActionSwapText } from "@/components/motion/action-swap";
import { Button } from "@/components/motion/button";
import { cn } from "@/lib/utils";
import { AccountSwitcher } from "./account-switcher";
import { WalletActions } from "./actions";
import { BalanceDelta } from "./balance-delta";
import { SearchBar } from "./search-bar";
import type { WalletCardProps } from "./types";

export type { WalletAccount, WalletCardProps } from "./types";

/**
 * Composed wallet overview card: an account switcher whose trigger morphs open
 * into a full-width panel, a search icon that morphs into a search bar, a
 * rolling balance with a transient change indicator, and Send / Deposit
 * actions. Actions and search are plain callbacks — the resulting flow is left
 * to the consumer.
 */
export function WalletCard({
  accounts,
  accountId,
  defaultAccountId,
  onAccountChange,
  balance,
  balancePrefix = "$",
  defaultChange,
  defaultBalanceHidden = false,
  onSend,
  onDeposit,
  onSwap,
  onBuy,
  searchPlaceholder,
  searchRecent,
  onSearchChange,
  onSearchSubmit,
  hasNotifications = false,
  onNotifications,
  className,
}: WalletCardProps) {
  const accountControlled = accountId !== undefined;
  const [internalAccountId, setInternalAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id,
  );
  const [balanceHidden, setBalanceHidden] = useState(defaultBalanceHidden);

  const shownBalance = `${balancePrefix}${balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const maskedBalance = "*".repeat(7);
  const activeAccountId = accountControlled ? accountId : internalAccountId;
  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? accounts[0];

  const handleAccountChange = (id: string) => {
    if (!accountControlled) setInternalAccountId(id);
    onAccountChange?.(id);
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-xs overflow-hidden rounded-4xl border border-border p-6",
        className,
      )}
    >
      {/* relative anchor so the switcher + search panels span the whole row */}
      <div className="relative flex items-center justify-between gap-2">
        <AccountSwitcher
          accounts={accounts}
          activeAccount={activeAccount}
          onSelect={handleAccountChange}
        />

        <div className="flex shrink-0 items-center gap-1">
          <SearchBar
            placeholder={searchPlaceholder}
            recent={searchRecent}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotifications}
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {hasNotifications ? (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Balance</p>
          <button
            type="button"
            onClick={() => setBalanceHidden((h) => !h)}
            aria-label={balanceHidden ? "Show balance" : "Hide balance"}
            aria-pressed={balanceHidden}
            className="text-muted-foreground outline-none transition-colors hover:text-foreground"
          >
            {balanceHidden ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {/* One ActionSwapText swaps the number and the asterisk mask with a
            per-letter cascade — same baseline, no overlap or layout shift. */}
        <ActionSwapText
          value={balanceHidden ? "hidden" : shownBalance}
          animation="cascade"
          className="text-3xl font-semibold text-foreground"
        >
          {balanceHidden ? maskedBalance : shownBalance}
        </ActionSwapText>
        {balanceHidden ? (
          <div className="mt-2 flex h-7 items-center justify-center">
            <span className="translate-y-[3px] text-sm font-semibold text-muted-foreground leading-none tracking-[0.3em]">
              *****
            </span>
          </div>
        ) : (
          <BalanceDelta balance={balance} initialChange={defaultChange} />
        )}
      </div>

      <div className="mt-8">
        <WalletActions
          onSend={onSend}
          onDeposit={onDeposit}
          onSwap={onSwap}
          onBuy={onBuy}
        />
      </div>
    </div>
  );
}
