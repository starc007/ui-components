import { cn } from "@/lib/utils";
import type { WalletAccount } from "./types";
import { diceBearGlassUrl } from "./utils";

export function AccountAvatar({
  account,
  className,
}: {
  account: WalletAccount;
  className?: string;
}) {
  if (account.avatar) return <>{account.avatar}</>;
  return (
    // biome-ignore lint/performance/noImgElement: remote DiceBear SVG, no next/image benefit
    <img
      src={diceBearGlassUrl(account.id || account.address)}
      alt={account.name}
      className={cn("h-7 w-7 shrink-0 rounded-full bg-muted", className)}
    />
  );
}
