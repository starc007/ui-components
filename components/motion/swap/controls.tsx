"use client";

import { ArrowDownUp, Check, ChevronDown, Send, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { EASE } from "./constants";
import { type SwapMessages, swapMessages } from "./messages";
import type { Token } from "./types";
import { isValidAddress, truncateAddress } from "./utils";

export function FlipButton({
  rotation,
  reduce,
  onClick,
  labels,
}: {
  rotation: number;
  reduce: boolean;
  onClick: () => void;
  labels?: Partial<SwapMessages>;
}) {
  const t = useMessages("swap", swapMessages, labels);
  return (
    <div className="relative -my-4 flex justify-center" style={{ zIndex: 1 }}>
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={t("reverse")}
        whileTap={reduce ? undefined : { scale: 0.9 }}
        animate={reduce ? undefined : { rotate: rotation }}
        transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-card bg-muted text-foreground backdrop-blur"
      >
        <ArrowDownUp className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}

export function ActionButton({
  from,
  to,
  amount,
  destAddress,
  labels,
}: {
  from: Token;
  to: Token;
  amount: number;
  destAddress: string;
  labels?: Partial<SwapMessages>;
}) {
  const t = useMessages("swap", swapMessages, labels);
  const reduce = useReducedMotion();
  const noAmount = amount <= 0;
  const overBalance = from.balance !== undefined && amount > from.balance;
  const validDest = destAddress && isValidAddress(destAddress);
  const label = noAmount
    ? t("enterAmount")
    : overBalance
      ? t("insufficient", { symbol: from.symbol })
      : validDest
        ? t("swapAndSend", { address: truncateAddress(destAddress) })
        : t("swapTokens", { from: from.symbol, to: to.symbol });
  const disabled = noAmount || overBalance;

  return (
    <motion.button
      type="button"
      whileTap={disabled || reduce ? undefined : { scale: 0.97 }}
      transition={SPRING_PRESS}
      disabled={disabled}
      className={cn(
        "mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed bg-muted text-muted-foreground"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14, ease: EASE }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function DestinationRow({
  show,
  onToggle,
  address,
  onAddress,
  reduce,
  labels,
}: {
  show: boolean;
  onToggle: () => void;
  address: string;
  onAddress: (v: string) => void;
  reduce: boolean;
  labels?: Partial<SwapMessages>;
}) {
  const t = useMessages("swap", swapMessages, labels);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAddress = address.length > 0;
  const valid = isValidAddress(address);

  useEffect(() => {
    if (!show) return;
    requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
  }, [show]);

  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-border/50 bg-background/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-[12px] text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Send className="h-3.5 w-3.5 shrink-0" />
          <span>
            {show && hasAddress && valid
              ? t("sendTo", { address: truncateAddress(address) })
              : t("sendToOther")}
          </span>
        </span>
        <motion.span
          animate={reduce ? {} : { rotate: show ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE }}
          style={{ display: "inline-flex" }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {show ? (
          <motion.div
            key="dest-input"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-border/50 px-3.5 pb-3 pt-2.5">
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
                  hasAddress && !valid
                    ? "border-destructive/40"
                    : "border-border",
                )}
              >
                <input
                  ref={inputRef}
                  value={address}
                  onChange={(e) => onAddress(e.target.value.trim())}
                  placeholder={t("addressPlaceholder")}
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-foreground outline-none placeholder:text-muted-foreground/60"
                />
                <AnimatePresence mode="wait">
                  {hasAddress ? (
                    valid ? (
                      <motion.span
                        key="check"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.14, ease: EASE }}
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      </motion.span>
                    ) : (
                      <motion.button
                        key="clear"
                        type="button"
                        onClick={() => onAddress("")}
                        aria-label={t("clearAddress")}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.14, ease: EASE }}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </motion.button>
                    )
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
