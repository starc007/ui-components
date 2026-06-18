"use client";

import { Banknote, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

export type PredictionMarketMode = "buy" | "sell";

export type PredictionMarketOutcome = {
  id: string;
  label: string;
  price: number;
};

export type PredictionMarketOrderValue = {
  mode: PredictionMarketMode;
  outcomeId: string;
  amount: string;
};

export type PredictionMarketQuote = {
  valid: boolean;
  amount: number;
  price: number;
  shares: number;
  payout: number;
  error?: string;
};

export type PredictionMarketClassNames = {
  root?: string;
  header?: string;
  tabs?: string;
  outcomes?: string;
  amount?: string;
  chips?: string;
  footer?: string;
  action?: string;
};

export interface PredictionMarketProps {
  outcomes?: PredictionMarketOutcome[];
  value?: PredictionMarketOrderValue;
  defaultValue?: Partial<PredictionMarketOrderValue>;
  onValueChange?: (value: PredictionMarketOrderValue) => void;
  onTrade?: (
    order: PredictionMarketOrderValue,
    quote: PredictionMarketQuote,
  ) => void;
  onSignIn?: () => void;
  authenticated?: boolean;
  orderTypeLabel?: string;
  balance?: number;
  positions?: Record<string, number>;
  quickAmounts?: number[];
  minTrade?: number;
  className?: string;
  classNames?: PredictionMarketClassNames;
}

const DEFAULT_OUTCOMES: PredictionMarketOutcome[] = [
  { id: "up", label: "Up", price: 0.09 },
  { id: "down", label: "Down", price: 0.91 },
];

const MODES: { id: PredictionMarketMode; label: string }[] = [
  { id: "buy", label: "Buy" },
  { id: "sell", label: "Sell" },
];

const DEFAULT_QUICK_AMOUNTS = [10, 50, 100, 500];
const FAST_TRANSITION = { duration: 0.16, ease: EASE_OUT } as const;
const DIGIT_TRANSITION = { duration: 0.18, ease: EASE_OUT } as const;

function useControllableOrder({
  value,
  defaultValue,
  outcomes,
  onValueChange,
}: {
  value?: PredictionMarketOrderValue;
  defaultValue?: Partial<PredictionMarketOrderValue>;
  outcomes: PredictionMarketOutcome[];
  onValueChange?: (value: PredictionMarketOrderValue) => void;
}) {
  const initialValue: PredictionMarketOrderValue = {
    mode: defaultValue?.mode ?? "buy",
    outcomeId: defaultValue?.outcomeId ?? outcomes[0]?.id ?? "",
    amount: defaultValue?.amount ?? "",
  };

  const [internalValue, setInternalValue] = useState(initialValue);
  const controlled = value !== undefined;
  const order = value ?? internalValue;

  const setOrder = useCallback(
    (next: PredictionMarketOrderValue) => {
      if (!controlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  return [order, setOrder] as const;
}

function sanitizeAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, "");
  const [whole, ...decimalParts] = normalized.split(".");
  const decimal = decimalParts.join("");
  if (decimalParts.length === 0) return whole;
  return `${whole}.${decimal.slice(0, 2)}`;
}

function parseAmount(value: string) {
  return Number(value) || 0;
}

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return value >= 100
    ? formatCurrency(value, 0)
    : formatCurrency(value, value % 1 === 0 ? 0 : 2);
}

function formatCents(value: number) {
  const cents = value * 100;
  const precision = Number.isInteger(cents) ? 0 : 1;
  return `${cents.toFixed(precision)}¢`;
}

function buildQuote({
  order,
  outcome,
  balance,
  position,
  minTrade,
}: {
  order: PredictionMarketOrderValue;
  outcome: PredictionMarketOutcome;
  balance: number;
  position: number;
  minTrade: number;
}): PredictionMarketQuote {
  const amount = parseAmount(order.amount);
  const price = Math.max(0.01, Math.min(0.99, outcome.price));
  const shares = order.mode === "buy" ? amount / price : amount;
  const payout = order.mode === "buy" ? shares : amount * price;

  if (amount <= 0) {
    return {
      valid: false,
      amount,
      price,
      shares: 0,
      payout: 0,
      error: "Enter an amount",
    };
  }

  if (order.mode === "buy" && amount < minTrade) {
    return {
      valid: false,
      amount,
      price,
      shares,
      payout,
      error: `Minimum ${formatCompactCurrency(minTrade)}`,
    };
  }

  if (order.mode === "buy" && amount > balance) {
    return {
      valid: false,
      amount,
      price,
      shares,
      payout,
      error: "Insufficient balance",
    };
  }

  if (order.mode === "sell" && amount > position) {
    return {
      valid: false,
      amount,
      price,
      shares,
      payout,
      error: "Not enough shares",
    };
  }

  return {
    valid: true,
    amount,
    price,
    shares,
    payout,
  };
}

function RollingValue({
  value,
  reduce,
  muted,
}: {
  value: string;
  reduce: boolean;
  muted?: boolean;
}) {
  const chars = value.split("");

  return (
    <span
      aria-hidden
      className={cn(
        "flex justify-center overflow-hidden text-5xl font-semibold leading-none tracking-tight tabular-nums sm:text-6xl",
        muted ? "text-muted-foreground/55" : "text-foreground",
      )}
    >
      {chars.map((char, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed character slots for rolling display.
          key={`${index}-${char}`}
          className="relative inline-block min-w-[0.55em] overflow-hidden"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed visual character slots, animated by position.
              key={`${index}-${char}`}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, transform: "translateY(70%)" }
              }
              animate={{ opacity: 1, transform: "translateY(0%)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, transform: "translateY(-70%)" }
              }
              transition={DIGIT_TRANSITION}
              className="inline-block"
            >
              {char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

export function PredictionMarket({
  outcomes = DEFAULT_OUTCOMES,
  value,
  defaultValue,
  onValueChange,
  onTrade,
  onSignIn,
  authenticated = true,
  orderTypeLabel = "Market",
  balance = 500,
  positions = { up: 24, down: 16 },
  quickAmounts = DEFAULT_QUICK_AMOUNTS,
  minTrade = 1,
  className,
  classNames,
}: PredictionMarketProps) {
  const inputId = useId();
  const reduce = useReducedMotion() ?? false;
  const amountRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"idle" | "placing" | "filled">("idle");
  const [shakeKey, setShakeKey] = useState(0);
  const [order, setOrder] = useControllableOrder({
    value,
    defaultValue,
    outcomes,
    onValueChange,
  });

  const selectedOutcome =
    outcomes.find((outcome) => outcome.id === order.outcomeId) ?? outcomes[0];
  const position = positions[selectedOutcome.id] ?? 0;
  const quote = useMemo(
    () =>
      buildQuote({
        order,
        outcome: selectedOutcome,
        balance,
        position,
        minTrade,
      }),
    [balance, minTrade, order, position, selectedOutcome],
  );

  const setOrderValue = useCallback(
    (next: Partial<PredictionMarketOrderValue>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setStatus("idle");
      setOrder({ ...order, ...next });
    },
    [order, setOrder],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (shakeKey === 0 || reduce || !amountRef.current) return;
    animate(
      amountRef.current,
      { x: [0, -5, 5, -3, 3, -1, 0] },
      { duration: 0.38, ease: EASE_OUT },
    );
  }, [reduce, shakeKey]);

  const addAmount = (increment: number) => {
    const next = parseAmount(order.amount) + increment;
    setOrderValue({ amount: String(next) });
  };

  const setMax = () => {
    if (order.mode === "buy") {
      setOrderValue({ amount: String(Math.floor(balance)) });
      return;
    }

    setOrderValue({ amount: position.toFixed(position % 1 === 0 ? 0 : 2) });
  };

  const submit = () => {
    if (!authenticated) {
      onSignIn?.();
      return;
    }

    if (!quote.valid) {
      setShakeKey((key) => key + 1);
      return;
    }

    setStatus("placing");
    timeoutRef.current = setTimeout(() => {
      setStatus("filled");
      onTrade?.(order, quote);
    }, 650);
  };

  const amountDisplay =
    order.mode === "buy" ? `$${order.amount || "0"}` : `${order.amount || "0"}`;
  const actionLabel = !authenticated
    ? "Sign In"
    : status === "placing"
      ? "Trading"
      : status === "filled"
        ? "Trade filled"
        : quote.valid
          ? "Trade"
          : quote.error;
  const showFooter = authenticated;

  return (
    <div
      className={cn(
        "w-full max-w-[400px] overflow-hidden rounded-3xl border border-border bg-card",
        className,
        classNames?.root,
      )}
    >
      <div
        className={cn(
          "border-b border-border/80 px-4 pt-4",
          classNames?.header,
        )}
      >
        <div className="flex items-end justify-between gap-4">
          <Tabs
            value={order.mode}
            onValueChange={(mode) =>
              setOrderValue({
                mode: mode as PredictionMarketMode,
                amount: "",
              })
            }
            variant="underline"
            className={cn("shrink-0", classNames?.tabs)}
          >
            <TabsList className="gap-5 border-b-0 bg-transparent p-0">
              {MODES.map((mode) => (
                <TabsTrigger
                  key={mode.id}
                  value={mode.id}
                  className="px-0 pb-3 pt-0 text-2xl font-semibold"
                  indicatorClassName="h-0.5 bg-foreground"
                >
                  {mode.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <button
            type="button"
            disabled={status === "placing"}
            className="mb-3 inline-flex items-center gap-2 text-xl font-semibold text-foreground transition-opacity disabled:opacity-50"
          >
            {orderTypeLabel}
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 p-3">
        <Tabs
          value={selectedOutcome.id}
          onValueChange={(outcomeId) => setOrderValue({ outcomeId })}
          variant="pill"
          className={classNames?.outcomes}
        >
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-[1.75rem] bg-muted p-1.5">
            {outcomes.map((outcome) => {
              const selected = outcome.id === selectedOutcome.id;
              const isNo =
                outcome.label.toLowerCase() === "no" ||
                outcome.label.toLowerCase() === "down";

              return (
                <TabsTrigger
                  key={outcome.id}
                  value={outcome.id}
                  indicatorClassName={
                    isNo
                      ? "bg-red-500/10 dark:bg-red-500/15"
                      : "bg-emerald-500/20"
                  }
                  className={cn(
                    "h-14 w-full rounded-[1.35rem] px-0 py-0 text-base font-semibold active:scale-[0.99]",
                    isNo
                      ? selected
                        ? "text-red-300 dark:text-red-300"
                        : "text-red-300/55 dark:text-red-300/50"
                      : selected
                        ? "text-emerald-400 dark:text-emerald-300"
                        : "text-muted-foreground",
                  )}
                >
                  {outcome.label} {formatCents(outcome.price)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div
          ref={amountRef}
          className={cn("rounded-3xl bg-background p-4", classNames?.amount)}
        >
          <div className="flex min-h-24 flex-col items-center justify-center gap-4 text-center">
            <label
              htmlFor={inputId}
              className="text-xl font-medium text-foreground"
            >
              {order.mode === "buy" ? "Amount" : "Shares"}
            </label>

            <div className="relative w-full min-w-0 text-center">
              <RollingValue
                value={amountDisplay}
                reduce={reduce}
                muted={order.amount === ""}
              />
              <input
                id={inputId}
                value={order.amount}
                disabled={status === "placing"}
                onChange={(event) =>
                  setOrderValue({ amount: sanitizeAmount(event.target.value) })
                }
                inputMode="decimal"
                aria-label={order.mode === "buy" ? "Amount" : "Shares"}
                className="absolute inset-0 z-10 h-full w-full cursor-text bg-transparent text-center text-5xl text-transparent caret-transparent outline-none disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div
            className={cn(
              "mt-8 flex flex-wrap justify-center gap-2",
              classNames?.chips,
            )}
          >
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={status === "placing"}
                onClick={() => addAmount(amount)}
                className="h-9 rounded-xl border border-border/50 bg-card px-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                +{order.mode === "buy" ? formatCompactCurrency(amount) : amount}
              </button>
            ))}
            <button
              type="button"
              disabled={status === "placing"}
              onClick={setMax}
              className="h-9 rounded-xl border border-border/50 bg-card px-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Max
            </button>
          </div>
        </div>
      </div>

      {showFooter ? (
        <div
          className={cn(
            "border-t border-border/80 px-4 py-4",
            classNames?.footer,
          )}
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                {order.mode === "buy" ? "To win" : "To receive"}
                <Banknote className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Price {formatCents(quote.price)}
              </p>
            </div>
            <div className="text-right text-4xl font-semibold leading-none tracking-tight text-emerald-500 tabular-nums">
              {formatCurrency(quote.payout)}
            </div>
          </div>

          <button
            type="button"
            disabled={status === "placing"}
            onClick={submit}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 text-base font-semibold text-white transition-[background-color,transform,opacity] duration-150 hover:bg-blue-500/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
              classNames?.action,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={actionLabel}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(4px)" }
                }
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, transform: "translateY(-4px)" }
                }
                transition={FAST_TRANSITION}
                className="inline-flex items-center gap-2"
              >
                {status === "placing" ? (
                  <Loader2
                    className={cn("h-4 w-4", !reduce && "animate-spin")}
                  />
                ) : status === "filled" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : null}
                {actionLabel}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      ) : (
        <div className="px-4 pb-5">
          <button
            type="button"
            onClick={submit}
            className={cn(
              "flex h-14 w-full items-center justify-center rounded-2xl bg-foreground text-base font-semibold text-background transition-transform duration-150 active:scale-[0.98]",
              classNames?.action,
            )}
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}
