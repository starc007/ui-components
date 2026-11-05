"use client";

import { ArrowDownToLine, ArrowUp, CreditCard, Repeat } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { type WalletCardMessages, walletCardMessages } from "./messages";

type WalletAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
};

/**
 * Row of primary wallet actions rendered icon-over-label, with a spring press.
 */
export function WalletActions({
  onSend,
  onDeposit,
  onSwap,
  onBuy,
  labels,
}: {
  onSend?: () => void;
  onDeposit?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
  labels?: Partial<WalletCardMessages>;
}) {
  const reduce = useReducedMotion();
  const t = useMessages("walletCard", walletCardMessages, labels);

  const actions: WalletAction[] = [
    { key: "send", label: t("send"), icon: ArrowUp, onClick: onSend },
    { key: "deposit", label: t("deposit"), icon: ArrowDownToLine, onClick: onDeposit },
    { key: "swap", label: t("swap"), icon: Repeat, onClick: onSwap },
    { key: "buy", label: t("buy"), icon: CreditCard, onClick: onBuy },
  ];

  return (
    <div className="flex items-start justify-between gap-2">
      {actions.map(({ key, label, icon: Icon, onClick }) => (
        <motion.button
          key={key}
          type="button"
          onClick={onClick}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={SPRING_PRESS}
          className="flex flex-1 flex-col items-center gap-2 outline-none"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
