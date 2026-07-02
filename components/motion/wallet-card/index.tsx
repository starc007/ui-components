"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/motion/button";
import { NumberTicker } from "@/components/motion/number-ticker";
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
  onSend,
  onDeposit,
  onSwap,
  onBuy,
  searchPlaceholder,
  searchRecent,
  onSearchChange,
  onSearchSubmit,
  onNotifications,
  className,
}: WalletCardProps) {
  const accountControlled = accountId !== undefined;
  const [internalAccountId, setInternalAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id,
  );
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
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <p className="text-xs text-muted-foreground">Balance</p>
        <NumberTicker
          value={Math.round(balance * 100)}
          prefix={balancePrefix}
          format={(n) =>
            (n / 100).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }
          startOnView={false}
          className="text-3xl font-semibold text-foreground"
        />
        <BalanceDelta balance={balance} />
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
