"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { InfiniteMasonry } from "@/components/motion/infinite-masonry";

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  imageHeight: number;
};

const PAGE_SIZE = 6;
const MAX_ITEMS = 42;

const gallerySource = [
  {
    title: "Soft geometry",
    category: "Architecture",
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=720&q=80",
    imageHeight: 260,
  },
  {
    title: "Open horizon",
    category: "Landscape",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=720&q=80",
    imageHeight: 190,
  },
  {
    title: "Working rhythm",
    category: "Workspace",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=720&q=80",
    imageHeight: 230,
  },
  {
    title: "Shared table",
    category: "Studio",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=720&q=80",
    imageHeight: 300,
  },
  {
    title: "In session",
    category: "People",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=720&q=80",
    imageHeight: 210,
  },
  {
    title: "After hours",
    category: "Office",
    image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=720&q=80",
    imageHeight: 280,
  },
] as const;

function createItems(start: number, count: number): GalleryItem[] {
  return Array.from({ length: count }, (_, offset) => {
    const index = start + offset;
    const source = gallerySource[index % gallerySource.length];

    return {
      ...source,
      id: `gallery-${index}`,
      title: `${source.title} ${Math.floor(index / gallerySource.length) + 1}`,
    };
  });
}

export function InfiniteMasonryPreview() {
  const [items, setItems] = useState(() => createItems(0, 12));
  const [loading, setLoading] = useState(false);
  const hasMore = items.length < MAX_ITEMS;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 650));
    setItems((current) => {
      const count = Math.min(PAGE_SIZE, MAX_ITEMS - current.length);
      return count > 0
        ? [...current, ...createItems(current.length, count)]
        : current;
    });
    setLoading(false);
  }, [hasMore, loading]);

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-3 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-sm font-semibold text-foreground">Visual index</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Scroll to load the next page
          </p>
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground">
          {items.length} items
        </p>
      </div>

      <InfiniteMasonry
        items={items}
        getItemKey={(item) => item.id}
        renderItem={(item) => (
          <figure className="overflow-hidden rounded-2xl border border-border bg-card">
            <div
              className="relative w-full overflow-hidden"
              style={{ height: item.imageHeight }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <figcaption className="flex items-start justify-between gap-3 p-3">
              <p className="text-sm font-medium text-foreground">
                {item.title}
              </p>
              <p className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.category}
              </p>
            </figcaption>
          </figure>
        )}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        estimateSize={(item) => item.imageHeight + 66}
        ariaLabel="Visual inspiration gallery"
        className="h-[34rem]"
      />
    </div>
  );
}
