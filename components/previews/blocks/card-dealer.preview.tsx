"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/motion/button";
import { CardDealer, type CardDealerCard } from "@/components/motion/card-dealer";

const SUITS = [
  { key: "spades", symbol: "♠", red: false },
  { key: "hearts", symbol: "♥", red: true },
  { key: "clubs", symbol: "♣", red: false },
  { key: "diamonds", symbol: "♦", red: true },
] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RANK_NAMES: Record<string, string> = { A: "Ace", J: "Jack", Q: "Queen", K: "King" };
const HAND_LIMIT = 13;

type PlayingCard = CardDealerCard & { rank: number; suit: number };

// Seeded, so the server and the first client render agree on the deck order.
function shuffle<T>(items: T[], seed: number) {
  const out = [...items];
  let state = seed;
  for (let i = out.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function createDeck(): PlayingCard[] {
  const cards = SUITS.flatMap((suit, s) =>
    RANKS.map((rank, r) => ({
      id: `${rank}-${suit.key}`,
      zone: "deck" as const,
      label: `${RANK_NAMES[rank] ?? rank} of ${suit.key}`,
      rank: r,
      suit: s,
    })),
  );
  return shuffle(cards, 7);
}

/** Moves cards to the end of the list so they land on top of their new zone. */
function moveTo(cards: PlayingCard[], ids: string[], zone: PlayingCard["zone"]) {
  const moving = new Set(ids);
  const picked = ids
    .map((id) => cards.find((card) => card.id === id))
    .filter((card): card is PlayingCard => Boolean(card))
    .map((card) => ({ ...card, zone }));
  return [...cards.filter((card) => !moving.has(card.id)), ...picked];
}

function Face({ card }: { card: PlayingCard }) {
  const suit = SUITS[card.suit];
  const rank = RANKS[card.rank];
  return (
    <span
      className={`flex size-full flex-col justify-between rounded-xl border border-black/10 bg-white p-2 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.35)] ${suit.red ? "text-rose-500" : "text-neutral-900"}`}
    >
      <span className="flex flex-col items-start text-sm font-semibold leading-none">
        {rank}
        <span className="text-xs">{suit.symbol}</span>
      </span>
      <span className="self-center text-3xl leading-none">{suit.symbol}</span>
      <span className="flex rotate-180 flex-col items-start text-sm font-semibold leading-none">
        {rank}
        <span className="text-xs">{suit.symbol}</span>
      </span>
    </span>
  );
}

function Back() {
  return (
    <span className="block size-full rounded-xl border border-white/20 bg-neutral-800 p-1.5 shadow-[0_6px_16px_-6px_rgb(0_0_0/0.35)]">
      <span className="block size-full rounded-lg border border-white/25 bg-[repeating-linear-gradient(45deg,rgb(255_255_255/0.12)_0_5px,transparent_5px_10px)]" />
    </span>
  );
}

export function CardDealerPreview() {
  const [cards, setCards] = useState(createDeck);
  const deck = cards.filter((card) => card.zone === "deck");
  const hand = cards.filter((card) => card.zone === "hand");

  // Open with a dealt hand, after the table has measured itself.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCards((current) => {
        const top = current.filter((card) => card.zone === "deck").slice(-5).reverse();
        return moveTo(current, top.map((card) => card.id), "hand");
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  // Deals from the top of the deck, never past the hand limit.
  const deal = (count: number) =>
    setCards((current) => {
      const room = HAND_LIMIT - current.filter((card) => card.zone === "hand").length;
      const top = current
        .filter((card) => card.zone === "deck")
        .slice(-Math.max(0, Math.min(count, room)))
        .reverse();
      return top.length ? moveTo(current, top.map((card) => card.id), "hand") : current;
    });
  const sort = () =>
    setCards((current) =>
      moveTo(
        current,
        current
          .filter((card) => card.zone === "hand")
          .sort((a, b) => a.suit - b.suit || a.rank - b.rank)
          .map((card) => card.id),
        "hand",
      ),
    );
  const shuffleHand = () =>
    setCards((current) =>
      moveTo(
        current,
        shuffle(
          current.filter((card) => card.zone === "hand").map((card) => card.id),
          Date.now() % 2147483647,
        ),
        "hand",
      ),
    );
  const collect = () =>
    setCards((current) =>
      moveTo(
        current,
        shuffle(
          current.filter((card) => card.zone !== "deck").map((card) => card.id),
          Date.now() % 2147483647,
        ),
        "deck",
      ),
    );

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <CardDealer
        cards={cards}
        renderFace={(card) => <Face card={card} />}
        renderBack={() => <Back />}
        onCardSelect={(id) => setCards((current) => moveTo(current, [id], "pile"))}
        aria-label="Card table. Select a card in your hand to play it."
      />
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" onClick={() => deal(1)} disabled={!deck.length || hand.length >= HAND_LIMIT}>
          Deal
        </Button>
        <Button size="sm" onClick={() => deal(3)} disabled={!deck.length || hand.length >= HAND_LIMIT}>
          Deal 3
        </Button>
        <Button size="sm" variant="secondary" onClick={sort} disabled={hand.length < 2}>
          Sort
        </Button>
        <Button size="sm" variant="secondary" onClick={shuffleHand} disabled={hand.length < 2}>
          Shuffle
        </Button>
        <Button size="sm" variant="secondary" onClick={collect} disabled={deck.length === cards.length}>
          Collect
        </Button>
      </div>
    </div>
  );
}
