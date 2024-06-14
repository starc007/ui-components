"use client";
import React, { useState } from "react";

const ShowCarousel = () => {
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Accordian${id}.tsx`).default;
    setCodeString(codeString);
  };
  return (
    <div className="flex flex-col">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-medium text-gray-500">
            Horizontal Carousel on Scroll
          </h1>
          <button
            onClick={() => {
              getCode(1);
              setShowSlideOver(true);
            }}
            className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
          >
            View code
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowCarousel;
