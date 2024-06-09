"use client";
import React, { useState } from "react";
import Hero1 from "./Hero1";
import { RenderCode, SlideOver } from "@/components/appComp";

const ShowHeros = () => {
  const [showSlider, setShowSlider] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Hero${id}.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");
    setCodeString(filteredCode);
  };
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-primary">Simple hero section</p>
        <button
          onClick={() => {
            getCode(1);
            setShowSlider(true);
          }}
          className="text-sm border px-3 py-1.5 font-medium rounded-lg text-gray-600"
        >
          View code
        </button>
      </div>
      <div className="border border-gray-100 rounded-xl p-4">
        <Hero1 />
      </div>
      <SlideOver isSlideOpen={showSlider} setIsSlideOpen={setShowSlider}>
        <RenderCode code={codeString} />
      </SlideOver>
    </div>
  );
};

export default ShowHeros;
