"use client";

import { motion, useReducedMotion } from "motion/react";
import { createContext, useContext, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { buildOrderBook } from "./order-book/model";

export type OrderBookLevel = { price: number; size: number };

export interface OrderBookProps {
  /** Snapshot of buy levels. Equal prices are combined; invalid and zero sizes are omitted. */
  bids: readonly OrderBookLevel[];
  /** Snapshot of sell levels. Supply new arrays when the book changes. */
  asks: readonly OrderBookLevel[];
  /** Number of nearest levels to show on each side. */
  levels?: number;
  /** Last traded price. Omit to show the midpoint of the best bid and ask. */
  lastPrice?: number;
  label?: string;
  baseSymbol?: string;
  quoteSymbol?: string;
  formatPrice?: (value: number) => string;
  formatSize?: (value: number) => string;
  children?: ReactNode;
  className?: string;
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const sizeFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const defaultPrice = (value: number) => priceFormatter.format(value);
const defaultSize = (value: number) => sizeFormatter.format(value);

function useOrderBookModel({
  bids,
  asks,
  levels = 9,
  lastPrice,
  baseSymbol = "",
  quoteSymbol = "USD",
  formatPrice = defaultPrice,
  formatSize = defaultSize,
}: OrderBookProps) {
  const book = buildOrderBook(bids, asks, levels);
  return {
    ...book,
    price:
      lastPrice != null && Number.isFinite(lastPrice) && lastPrice > 0 ? lastPrice : book.midpoint,
    baseSymbol,
    quoteSymbol,
    formatPrice,
    formatSize,
    reduce: useReducedMotion(),
  };
}
const OrderBookContext = createContext<ReturnType<typeof useOrderBookModel> | null>(null);

export function useOrderBook() {
  const context = useContext(OrderBookContext);
  if (!context) throw new Error("Order book parts must be rendered inside OrderBook.");
  return context;
}

/** A snapshot-driven depth ladder. No timers or invented market data live in the chart. */
export function OrderBook({ children, className, label = "Order book", ...props }: OrderBookProps) {
  const model = useOrderBookModel(props);
  return (
    <OrderBookContext.Provider value={model}>
      <section
        aria-label={label}
        className={cn(
          "w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-background font-mono text-xs tabular-nums",
          className,
        )}
      >
        {children === undefined ? (
          <>
            <OrderBookHeader />
            <OrderBookSide side="ask" />
            <OrderBookSpread />
            <OrderBookSide side="bid" />
            <OrderBookBalance />
          </>
        ) : (
          children
        )}
      </section>
    </OrderBookContext.Provider>
  );
}

export function OrderBookHeader({ className }: { className?: string }) {
  const { baseSymbol, quoteSymbol } = useOrderBook();
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid grid-cols-3 py-3 text-[10px] uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      <span className="px-4">Price{quoteSymbol && ` (${quoteSymbol})`}</span>
      <span className="px-4 text-right">Size{baseSymbol && ` (${baseSymbol})`}</span>
      <span className="px-4 text-right">Total</span>
    </div>
  );
}

export function OrderBookSide({ side, className }: { side: "bid" | "ask"; className?: string }) {
  const { bids, asks, maxTotal, formatPrice, formatSize, reduce, baseSymbol, quoteSymbol } =
    useOrderBook();
  const rows = side === "ask" ? [...asks].reverse() : bids;
  const color =
    side === "ask" ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400";
  return (
    <table
      aria-label={side === "ask" ? "Asks · sell orders" : "Bids · buy orders"}
      className={cn("w-full table-fixed border-separate border-spacing-0", className)}
    >
      <thead className="sr-only">
        <tr>
          <th scope="col">Price {quoteSymbol}</th>
          <th scope="col">Size {baseSymbol}</th>
          <th scope="col">Cumulative total {baseSymbol}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
              No {side === "ask" ? "asks" : "bids"}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.price} className={cn("group", color)}>
              <td className="relative h-8 px-4 py-0">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1 inset-y-px w-[calc(300%-8px)] overflow-hidden rounded-sm"
                >
                  <motion.div
                    initial={false}
                    animate={{ transform: `scaleX(${maxTotal ? row.total / maxTotal : 0})` }}
                    transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }}
                    className="absolute inset-0 origin-right bg-current opacity-[0.12]"
                  />
                  <div className="absolute inset-0 bg-current opacity-0 transition-opacity duration-150 group-hover:opacity-[0.05]" />
                </div>
                <span className="relative">{formatPrice(row.price)}</span>
              </td>
              <td className="relative px-4 py-0 text-right text-foreground">
                <motion.span
                  key={row.size}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                >
                  {formatSize(row.size)}
                </motion.span>
              </td>
              <td className="relative px-4 py-0 text-right text-muted-foreground">
                {formatSize(row.total)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export function OrderBookSpread({ className }: { className?: string }) {
  const { price, spread, midpoint, formatPrice } = useOrderBook();
  return (
    <div
      className={cn(
        "my-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-border bg-muted/40 px-4 py-3",
        className,
      )}
    >
      <span className="text-base font-medium tracking-tight">
        <span className="sr-only">Reference price: </span>
        {price == null ? "—" : formatPrice(price)}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {spread == null || midpoint == null
          ? "Spread unavailable"
          : spread < 0
            ? "Crossed book"
            : `Spread ${formatPrice(spread)} · ${((spread / midpoint) * 100).toFixed(3)}%`}
      </span>
    </div>
  );
}

/** Balance of the displayed depth, not the entire exchange order book. */
export function OrderBookBalance({ className }: { className?: string }) {
  const { bidTotal, askTotal, reduce } = useOrderBook();
  const total = bidTotal + askTotal;
  const ratio = total ? bidTotal / total : 0.5;
  return (
    <div className={cn("space-y-2 border-t border-border px-4 pb-3 pt-3", className)}>
      <div className="flex justify-between text-[10px]">
        <span className="text-emerald-700 dark:text-emerald-400">
          Bids {total ? `${(ratio * 100).toFixed(1)}%` : "—"}
        </span>
        <span className="text-muted-foreground">Visible depth</span>
        <span className="text-rose-600 dark:text-rose-400">
          Asks {total ? `${((1 - ratio) * 100).toFixed(1)}%` : "—"}
        </span>
      </div>
      <div aria-hidden="true" className="relative h-1 overflow-hidden rounded-full bg-rose-500/25">
        <motion.div
          initial={false}
          animate={{ transform: `scaleX(${ratio})` }}
          transition={reduce ? { duration: 0 } : { duration: 0.24, ease: EASE_OUT }}
          className="absolute inset-0 origin-left bg-emerald-500/60"
        />
      </div>
    </div>
  );
}
