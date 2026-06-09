import { cn } from "@/lib/utils";
import type { Chain, Token } from "./types";

export function ChainChip({
  active,
  onClick,
  chain,
  label,
}: {
  active: boolean;
  onClick: () => void;
  chain?: Chain;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center rounded-xl border transition-colors active:scale-[0.97] transition-transform",
        chain ? "w-9" : "px-3",
        active
          ? "border-primary/20 bg-primary/5 text-foreground"
          : "border-border/60 bg-background/40 text-foreground hover:border-border",
      )}
      title={chain?.name ?? label}
    >
      {chain ? (
        <ChainDot chain={chain} size={20} />
      ) : (
        <span className="text-xs font-semibold">{label}</span>
      )}
    </button>
  );
}

export function ChainDot({ chain, size = 16 }: { chain: Chain; size?: number }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
        chain.tone,
      )}
    >
      {chain.symbol}
    </span>
  );
}

export function TokenDot({
  token,
  chain,
  size = 28,
}: {
  token: Token;
  chain: Chain;
  size?: number;
}) {
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-0 inline-flex items-center justify-center rounded-full border border-border bg-background text-[11px] font-bold text-foreground">
        {token.symbol.slice(0, 2)}
      </span>
      <span
        style={{
          width: size * 0.42,
          height: size * 0.42,
        }}
        className={cn(
          "absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full border-2 border-card text-[7px] font-bold",
          chain.tone,
        )}
      >
        {chain.symbol}
      </span>
    </span>
  );
}
