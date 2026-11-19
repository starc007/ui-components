"use client";

import { Bookshelf, type BookshelfBook } from "@/components/motion/bookshelf";

const BOOKS: BookshelfBook[] = [
  { id: "walden", title: "Walden", author: "Henry David Thoreau", color: "#5b6248", thickness: 38 },
  { id: "meditations", title: "Meditations", author: "Marcus Aurelius", color: "#2f3a4a", thickness: 34 },
  { id: "art-of-war", title: "The Art of War", author: "Sun Tzu", color: "#b5452f", thickness: 28 },
  { id: "middlemarch", title: "Middlemarch", author: "George Eliot", color: "#e3d7b8", thickness: 52 },
  { id: "moby-dick", title: "Moby-Dick", author: "Herman Melville", color: "#1f4e79", thickness: 48 },
  { id: "frankenstein", title: "Frankenstein", author: "Mary Shelley", color: "#3b3b3b", thickness: 36 },
  { id: "the-prince", title: "The Prince", author: "Niccolò Machiavelli", color: "#d9a93f", thickness: 30 },
  { id: "leaves-of-grass", title: "Leaves of Grass", author: "Walt Whitman", color: "#3f6b4f", thickness: 42 },
  { id: "on-liberty", title: "On Liberty", author: "John Stuart Mill", color: "#8a8174", thickness: 32 },
  { id: "the-odyssey", title: "The Odyssey", author: "Homer", color: "#7a3b2e", thickness: 46 },
];

export function BookshelfPreview() {
  return (
    <div className="flex w-full flex-col items-center gap-3 p-6">
      <Bookshelf books={BOOKS} defaultValue="middlemarch" sound className="w-full" />
      <p className="text-xs text-muted-foreground">
        Click a book to pull it out. Arrow keys browse the shelf.
      </p>
    </div>
  );
}
