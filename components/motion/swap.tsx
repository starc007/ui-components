"use client";

import { Settings } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ActionButton, DestinationRow, FlipButton } from "./swap/controls";
import { CHAINS, TOKENS } from "./swap/data";
import { Field } from "./swap/field";
import { type SwapMessages, swapMessages } from "./swap/messages";
import { QuoteRow } from "./swap/quote-row";
import { TokenPicker } from "./swap/token-picker";
import type { Chain, Token, TokenSide } from "./swap/types";
import { formatAmount } from "./swap/utils";

export { SWAP_DRAWER_EASE } from "./swap/constants";
export { type SwapMessages, swapMessages } from "./swap/messages";
export type { Chain, Token } from "./swap/types";

export interface MultiChainSwapProps {
  chains?: Chain[];
  tokens?: Token[];
  defaultFromId?: string;
  defaultToId?: string;
  /** Override any built-in string. */
  labels?: Partial<SwapMessages>;
  className?: string;
}

export function MultiChainSwap({
  chains = CHAINS,
  tokens = TOKENS,
  defaultFromId = "eth-eth",
  defaultToId = "sol-sol",
  labels,
  className,
}: MultiChainSwapProps) {
  const t = useMessages("swap", swapMessages, labels);
  const reduce = useReducedMotion();
  const [fromId, setFromId] = useState(defaultFromId);
  const [toId, setToId] = useState(defaultToId);
  const [amount, setAmount] = useState("1");
  const [flipRot, setFlipRot] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [picking, setPicking] = useState<TokenSide | null>(null);
  const [showDest, setShowDest] = useState(false);
  const [destAddress, setDestAddress] = useState("");

  const from = findToken(tokens, fromId);
  const to = findToken(tokens, toId);
  const fromChain = findChain(chains, from.chainId);
  const toChain = findChain(chains, to.chainId);

  const numericAmount = Number(amount) || 0;
  const quoteKey = `${numericAmount}:${fromId}:${toId}`;
  const rate = useMemo(() => {
    if (!from.usd || !to.usd) return 1;
    return from.usd / to.usd;
  }, [from.usd, to.usd]);
  const toAmount = numericAmount * rate;

  useEffect(() => {
    if (!quoteKey) return;
    if (numericAmount === 0) return;
    setQuoting(true);
    const id = setTimeout(() => setQuoting(false), 450);
    return () => clearTimeout(id);
  }, [numericAmount, quoteKey]);

  const flip = () => {
    setFlipRot((r) => r + 180);
    setFromId(toId);
    setToId(fromId);
  };

  const pickToken = (id: string) => {
    if (!picking) return;

    if (picking === "from") {
      if (id === toId) setToId(fromId);
      setFromId(id);
    } else {
      if (id === fromId) setFromId(toId);
      setToId(id);
    }

    setPicking(null);
  };

  return (
    <div
      className={cn(
        "relative isolate w-full max-w-[420px] overflow-hidden rounded-3xl",
        "border border-border/20 bg-card",
        className,
      )}
    >
      <div className="flex h-12 items-center justify-between border-b border-border/50 px-3">
        <span className="px-2 text-sm font-semibold tracking-tight text-foreground">
          {t("title")}
        </span>
        <button
          type="button"
          aria-label={t("settings")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform hover:bg-muted/60 hover:text-foreground active:scale-[0.97]"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <Field
          side="from"
          token={from}
          chain={fromChain}
          amount={amount}
          onAmount={setAmount}
          editable
          quoting={false}
          onOpenPicker={() => setPicking("from")}
          labels={labels}
        />

        <FlipButton
          rotation={flipRot}
          reduce={!!reduce}
          onClick={flip}
          labels={labels}
        />

        <Field
          side="to"
          token={to}
          chain={toChain}
          amount={toAmount > 0 ? formatAmount(toAmount) : ""}
          editable={false}
          quoting={quoting}
          onOpenPicker={() => setPicking("to")}
          labels={labels}
        />

        <QuoteRow
          from={from}
          to={to}
          rate={rate}
          fee={0.42}
          slippage={0.5}
          eta="≈ 24s"
          quoting={quoting}
          labels={labels}
        />

        <DestinationRow
          show={showDest}
          onToggle={() => {
            if (showDest) setDestAddress("");
            setShowDest((v) => !v);
          }}
          address={destAddress}
          onAddress={setDestAddress}
          reduce={!!reduce}
          labels={labels}
        />

        <ActionButton
          from={from}
          to={to}
          amount={numericAmount}
          destAddress={destAddress}
          labels={labels}
        />
      </div>

      <TokenPicker
        open={picking !== null}
        side={picking}
        chains={chains}
        tokens={tokens}
        selectedId={picking === "from" ? fromId : toId}
        onPick={pickToken}
        onClose={() => setPicking(null)}
        reduce={!!reduce}
        labels={labels}
      />
    </div>
  );
}

function findToken(tokens: Token[], id: string) {
  const token = tokens.find((t) => t.id === id);
  if (!token) throw new Error(`Unknown token id: ${id}`);
  return token;
}

function findChain(chains: Chain[], id: string) {
  const chain = chains.find((c) => c.id === id);
  if (!chain) throw new Error(`Unknown chain id: ${id}`);
  return chain;
}
