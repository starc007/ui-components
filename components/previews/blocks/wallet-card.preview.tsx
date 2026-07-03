"use client";

import { useState } from "react";
import { WalletCard } from "@/components/motion/wallet-card";
import { Button } from "@/components/motion/button";

const ACCOUNTS = [
  { id: "main", name: "Main Wallet", address: "0x8f3Cb1a29e4D7c6F1B2a3E9d0C4b5A6f7D8e9C0b" },
  { id: "trading", name: "Trading", address: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B" },
  { id: "cold", name: "Cold Storage", address: "0x9F8e7D6c5B4a3E2d1C0b9A8f7E6d5C4b3A2e1F0d" },
];

const RECENT_SEARCHES = ["vitalik.eth", "0xA0b8…6EB4", "Uniswap", "Send to Trading"];

export function WalletCardPreview() {
  const [balance, setBalance] = useState(12480.32);

  return (
    <div className="flex w-full flex-col items-center gap-4 p-6">
      <WalletCard
        accounts={ACCOUNTS}
        balance={balance}
        defaultChange={124.5}
        searchRecent={RECENT_SEARCHES}
        hasNotifications
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setBalance((b) => b + (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 400))}
      >
        Simulate balance change
      </Button>
    </div>
  );
}
