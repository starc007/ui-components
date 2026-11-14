"use client";

import { BeforeAfterSlider } from "@/components/motion/before-after-slider";

const PHOTO =
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80";

export function BeforeAfterSliderPreview() {
  return (
    <div className="mx-auto w-full max-w-xl min-w-0 px-4 py-6">
      <BeforeAfterSlider
        before={
          <img
            src={PHOTO}
            alt="Lake house at dawn, unedited"
            draggable={false}
            className="h-full w-full object-cover brightness-90 contrast-75 grayscale"
          />
        }
        after={
          <img
            src={PHOTO}
            alt="Lake house at dawn, color graded"
            draggable={false}
            className="h-full w-full object-cover"
          />
        }
      />
    </div>
  );
}
