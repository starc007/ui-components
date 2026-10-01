"use client";

import {
  ImageViewer,
  ImageViewerGallery,
  ImageViewerThumbnail,
  ImageViewerContent,
  ImageViewerCounter,
  ImageViewerClose,
  ImageViewerPrevious,
  ImageViewerCaption,
  ImageViewerNext,
} from "@/components/motion/morphing-lightbox";

const images = [
  {
    id: "architecture",
    src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&h=2000&q=85",
    alt: "Sculptural architecture",
    width: 1600,
    height: 2000,
    caption: "01 / Form and light",
  },
  {
    id: "landscape",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&h=2000&q=85",
    alt: "Open landscape",
    width: 1600,
    height: 2000,
    caption: "02 / A little room to breathe",
  },
  {
    id: "workspace",
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&h=2000&q=85",
    alt: "Light-filled workspace",
    width: 1600,
    height: 2000,
    caption: "03 / Places to make things",
  },
];

export function MorphingLightboxPreview() {
  return (
    <div className="w-full max-w-xl">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Collected moments
          </p>
          <h3 className="text-lg font-medium tracking-tight">
            Look a little closer.
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">3 photographs</span>
      </div>
      <ImageViewer images={images} label="Collected photographs">
        <ImageViewerGallery className="grid-cols-3 gap-2 sm:gap-3">
          {images.map((image) => (
            <ImageViewerThumbnail key={image.id} imageId={image.id} />
          ))}
        </ImageViewerGallery>
        <ImageViewerContent
          header={
            <>
              <ImageViewerCounter />
              <ImageViewerClose />
            </>
          }
        >
          <ImageViewerPrevious />
          <ImageViewerCaption />
          <ImageViewerNext />
        </ImageViewerContent>
      </ImageViewer>
      <p className="mt-4 text-xs text-muted-foreground">
        Open a photograph. Swipe or use the arrows to explore.
      </p>
    </div>
  );
}
