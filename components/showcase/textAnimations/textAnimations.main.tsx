"use client";

import React, { useState } from "react";
import FlipTextAnimation from "./TextAnimation1";
import { RenderCode, SlideOver } from "@/components/appComp";
import TextAnimation2 from "./TextAnimation2";
const words = ["Pretty", "Faster", "Better"];

const TextAnimations = () => {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./TextAnimation${id}.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");
    setCodeString(filteredCode);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Flip Text Rotate Animation</p>
        <button
          onClick={() => {
            getCode(1);
            setIsSliderOpen(true);
          }}
          className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
        >
          View code
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center py-8 border border-gray-200 rounded-xl">
        <h1 className="sm:text-4xl text-2xl font-semibold text-gray-400">
          Build your website <FlipTextAnimation words={words} />
        </h1>
      </div>
      <div className="flex justify-between items-center mt-10">
        <p className="text-sm font-medium">Text Generation Animation effect</p>
        <button
          onClick={() => {
            getCode(2);
            setIsSliderOpen(true);
          }}
          className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
        >
          View code
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center py-8 border border-gray-200 rounded-xl">
        <TextAnimation2
          text="Pretty Faster Better"
          containerClass="text-4xl text-gray-500 font-medium"
        />
      </div>
      <SlideOver
        isSlideOpen={isSliderOpen}
        setIsSlideOpen={setIsSliderOpen}
        title="Flip Text Animation Code"
      >
        <RenderCode code={codeString} />
      </SlideOver>
    </div>
  );
};

export default TextAnimations;
