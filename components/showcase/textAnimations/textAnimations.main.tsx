"use client";

import React, { useState } from "react";
import FlipTextAnimation from "./FlipTextAnimation";
import { RenderCode, SlideOver } from "@/components/appComp";
const words = ["Pretty", "Faster", "Better"];

const TextAnimations = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  const getAnimationCodeString = () => {
    const flipAnimeCodeString =
      require("!!raw-loader!./FlipTextAnimation.tsx").default;

    const filtered = flipAnimeCodeString.split("\n").slice(1).join("\n");
    return filtered;
  };

  const code = getAnimationCodeString();

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Flip Text Rotate Animation</p>
        <button
          onClick={() => setIsSliderOpen(true)}
          className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
        >
          View code
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center h-40 bg-gray-100 rounded-xl">
        <h1 className="text-5xl font-semibold text-gray-500">
          Build your website <FlipTextAnimation words={words} />
        </h1>
      </div>
      <SlideOver
        isSlideOpen={isSliderOpen}
        setIsSlideOpen={setIsSliderOpen}
        title="Flip Text Animation Code"
      >
        <RenderCode code={code} />
      </SlideOver>
    </div>
  );
};

export default TextAnimations;
