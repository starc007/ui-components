"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { EASE } from "./constants";
import { ChainChip, TokenDot } from "./token-badges";
import type { Chain, Token, TokenSide } from "./types";
import { formatAmount } from "./utils";

export function TokenPicker({
  open,
  side,
  chains,
  tokens,
  selectedId,
  onPick,
  onClose,
  reduce,
}: {
  open: boolean;
  side: TokenSide | null;
  chains: Chain[];
  tokens: Token[];
  selectedId: string;
  onPick: (id: string) => void;
  onClose: () => void;
  reduce: boolean;
}) {
  const [chainFilter, setChainFilter] = useState("all");
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const popular = useMemo(
    () => tokens.filter((t) => t.popular).slice(0, 6),
    [tokens],
  );
  const chainById = useMemo(
    () => new Map(chains.map((chain) => [chain.id, chain])),
    [chains],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tokens.filter((t) => {
      if (chainFilter !== "all" && t.chainId !== chainFilter) return false;
      if (!needle) return true;
      const chain = chains.find((c) => c.id === t.chainId);
      return [t.symbol, t.name, chain?.name, t.address].some((h) =>
        h?.toLowerCase().includes(needle),
      );
    });
  }, [q, chainFilter, tokens, chains]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute inset-0 z-10 cursor-default bg-background/40 backdrop-blur-sm"
          />

          <motion.div
            key="sheet"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: "100%" }}
            transition={
              reduce ? { duration: 0.18, ease: EASE } : SPRING_PANEL
            }
            className="absolute inset-x-0 bottom-0 z-20 flex max-h-[92%] flex-col rounded-t-3xl border-t border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Select ${side === "from" ? "from" : "to"} token`}
          >
            <div className="flex justify-center pb-1 pt-2.5">
              <span className="h-1 w-9 rounded-full bg-primary/15" />
            </div>

            <div className="flex items-center gap-2 border-b border-border px-4 pb-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or paste address"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 overflow-x-auto border-b border-border px-3 py-5">
              <ChainChip
                active={chainFilter === "all"}
                onClick={() => setChainFilter("all")}
                label="All"
              />
              {chains.map((c) => (
                <ChainChip
                  key={c.id}
                  active={chainFilter === c.id}
                  onClick={() => setChainFilter(c.id)}
                  chain={c}
                />
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 pt-3">
              {!q && chainFilter === "all" ? (
                <>
                  <p className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Most popular
                  </p>
                  <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex items-center gap-1.5 overflow-x-auto pb-3">
                    {popular.map((t) => {
                      const chain = chainById.get(t.chainId);
                      if (!chain) return null;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onPick(t.id)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background/50 py-1 pl-1 pr-3 text-sm font-semibold text-foreground transition-transform hover:border-border active:scale-[0.97]"
                        >
                          <TokenDot token={t} chain={chain} size={22} />
                          {t.symbol}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : null}

              <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {q ? "Results" : chainFilter === "all" ? "Trending" : "Tokens"}
              </p>
              <ul className="flex flex-col gap-0.5">
                {filtered.length === 0 ? (
                  <li className="py-8 text-center text-xs text-muted-foreground">
                    No tokens found
                  </li>
                ) : null}
                {filtered.map((t) => {
                  const chain = chainById.get(t.chainId);
                  if (!chain) return null;
                  const active = t.id === selectedId;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => onPick(t.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl px-2 py-2 text-left transition-colors active:scale-[0.97]",
                          active
                            ? "bg-primary/5"
                            : "hover:bg-primary/[0.04]",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <TokenDot token={t} chain={chain} size={32} />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {t.name}
                            </span>
                            <span className="truncate text-[11px] text-muted-foreground">
                              {t.symbol}
                            </span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                          {t.address ??
                            (t.balance ? formatAmount(t.balance) : "")}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
