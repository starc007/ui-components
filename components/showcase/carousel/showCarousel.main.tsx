"use client";
import React, { useState } from "react";

const carouselData = [
  {
    title: "Title 1",
    description: "Description 1",
    image:
      "https://images.pexels.com/photos/3509971/pexels-photo-3509971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Title 2",
    description: "Description 2",
    image:
      "https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    title: "Title 3",
    description: "Description 3",
    image:
      "https://images.pexels.com/photos/2258536/pexels-photo-2258536.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

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
