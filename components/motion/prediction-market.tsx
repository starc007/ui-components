"use client";

import { Banknote, ChevronDown } from "lucide-react";
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
  type CSSProperties,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { StatefulButton, type ButtonState } from "./button/stateful";
import { NumberTicker } from "./number-ticker";
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
const DIGIT_TRANSITION = { duration: 0.18, ease: EASE_OUT } as const;
type AmountInputStyle = CSSProperties & { "--amount-chars": string };

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

function keyedAmountChars(value: string) {
  const seen = new Map<string, number>();
  return value.split("").map((char) => {
    const count = seen.get(char) ?? 0;
    seen.set(char, count + 1);
    return { id: `${char}-${count}`, char };
  });
}

function amountInputSize(value: string) {
  const length = value.replace(/\D/g, "").length;
  if (length >= 10) return "text-3xl sm:text-4xl";
  if (length >= 8) return "text-4xl sm:text-5xl";
  if (length >= 6) return "text-[44px] sm:text-[56px]";
  return "text-5xl sm:text-6xl";
}

function payoutTickerSize(value: number) {
  const length = formatCurrency(value).length;
  if (length >= 16) return "text-xl sm:text-2xl";
  if (length >= 13) return "text-2xl";
  if (length >= 10) return "text-3xl";
  return "text-4xl";
}

function AnimatedAmountInput({
  id,
  value,
  mode,
  inputSize,
  disabled,
  reduce,
  onChange,
}: {
  id: string;
  value: string;
  mode: PredictionMarketMode;
  inputSize: string;
  disabled: boolean;
  reduce: boolean;
  onChange: (value: string) => void;
}) {
  const displayValue = value || "0";
  const chars = keyedAmountChars(displayValue);
  const inputStyle = {
    "--amount-chars": String(chars.length),
  } as AmountInputStyle;
  const label = mode === "buy" ? "Amount" : "Shares";

  return (
    <div className="flex min-w-0 items-center justify-center overflow-hidden">
      {mode === "buy" ? (
        <span
          aria-hidden
          className={cn(
            "shrink-0 font-semibold leading-none tracking-normal text-muted-foreground/65 tabular-nums transition-[font-size] duration-200",
            inputSize,
          )}
        >
          $
        </span>
      ) : null}

      <div className="relative min-w-0 shrink">
        <input
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(sanitizeAmount(event.target.value))}
          placeholder="0"
          inputMode="decimal"
          aria-label={label}
          autoComplete="off"
          className={cn(
            "w-[calc((var(--amount-chars)+1)*0.62em)] min-w-[0.8em] max-w-[260px] bg-transparent text-left font-semibold leading-none tracking-normal text-transparent outline-none tabular-nums",
            "caret-foreground transition-[font-size] duration-200 placeholder:text-transparent selection:bg-foreground/10 disabled:cursor-not-allowed",
            inputSize,
          )}
          style={inputStyle}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex min-w-0 items-center justify-start overflow-hidden font-semibold leading-none tracking-normal text-foreground tabular-nums transition-[font-size] duration-200",
            !value && "text-muted-foreground/55",
            inputSize,
          )}
          style={inputStyle}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {chars.map(({ id: charId, char }) => (
              <motion.span
                key={charId}
                layout={reduce ? false : "position"}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: 18, filter: "blur(10px)" }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -14, filter: "blur(10px)" }
                }
                transition={DIGIT_TRANSITION}
                className="inline-block min-w-[0.55em] text-center will-change-[transform,opacity,filter]"
              >
                {char}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
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

  const inputSize = amountInputSize(order.amount);
  const payoutSize = payoutTickerSize(quote.payout);
  const actionState: ButtonState =
    status === "placing"
      ? "loading"
      : status === "filled"
        ? "success"
        : quote.valid
          ? "idle"
          : "error";
  const showFooter = authenticated;

  return (
    <div
      className={cn(
        "w-full max-w-[400px] overflow-hidden rounded-3xl border border-border bg-background",
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
          <TabsList className="grid w-full grid-cols-2 gap-2 p-1.5">
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
          className={cn("rounded-3xl bg-card p-4", classNames?.amount)}
        >
          <div className="flex min-h-24 flex-col items-center justify-center gap-5 text-center">
            <label
              htmlFor={inputId}
              className="text-xl font-medium text-foreground mr-6"
            >
              {order.mode === "buy" ? "Amount" : "Shares"}
            </label>

            <div className="w-full min-w-0">
              <AnimatedAmountInput
                id={inputId}
                mode={order.mode}
                value={order.amount}
                disabled={status === "placing"}
                inputSize={inputSize}
                reduce={reduce}
                onChange={(amount) => setOrderValue({ amount })}
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
                className="h-9 rounded-xl bg-background px-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
              >
                +{order.mode === "buy" ? formatCompactCurrency(amount) : amount}
              </button>
            ))}
            <button
              type="button"
              disabled={status === "placing"}
              onClick={setMax}
              className="h-9 rounded-xl bg-background px-3.5 text-sm font-semibold text-foreground transition-[background-color,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
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
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0 shrink">
              <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                {order.mode === "buy" ? "To win" : "To receive"}
                <Banknote className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Avg. Price {formatCents(quote.price)}
              </p>
            </div>
            <NumberTicker
              value={quote.payout * 100}
              startOnView={false}
              duration={0.45}
              stagger={0}
              blur
              className={cn(
                "ml-auto min-w-0 shrink-0 justify-end whitespace-nowrap text-right font-semibold leading-none tracking-tight text-emerald-500 tabular-nums transition-[font-size] duration-200",
                payoutSize,
              )}
              format={(cents) => formatCurrency(cents / 100)}
            />
          </div>

          <StatefulButton
            state={actionState}
            variant="primary"
            size="lg"
            pressScale={0.98}
            onClick={submit}
            loadingText="Trading"
            successText="Trade filled"
            errorText={quote.error ?? "Enter an amount"}
            className={cn(
              "h-12 w-full rounded-2xl text-base font-semibold",
              classNames?.action,
            )}
          >
            Trade
          </StatefulButton>
        </div>
      ) : (
        <div className="px-4 pb-5">
          <StatefulButton
            state="idle"
            variant="primary"
            size="lg"
            pressScale={0.98}
            onClick={submit}
            className={cn(
              "h-14 w-full rounded-2xl text-base font-semibold",
              classNames?.action,
            )}
          >
            Connect
          </StatefulButton>
        </div>
      )}
    </div>
  );
}
