"use client";
import React, { useState } from "react";
import Carousel1 from "./Carousel1";
import { RenderCode, SlideOver } from "@/components/appComp";

const testimonials = [
  {
    id: 1,
    name: "Jane Doe",
    content:
      "Build your product 10x faster and better with beUi's components. Just copy and paste!",
    title: "CEO, Company A",
    image:
      "https://images.pexels.com/photos/3509971/pexels-photo-3509971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 2,
    name: "John Smith",
    content:
      "Build your product 10x faster and better with beUi's components. Just copy and paste!",
    title: "CTO, Company B",
    image:
      "https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 3,
    name: "Mary Johnson",
    content:
      "Build your product 10x faster and better with beUi's components. Just copy and paste!",
    title: "CFO, Company C",
    image:
      "https://images.pexels.com/photos/2258536/pexels-photo-2258536.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 4,
    name: "Test Smith",
    content:
      "Build your product 10x faster and better with beUi's components. Just copy and paste!",
    title: "CTO, Company B",
    image:
      "https://images.pexels.com/photos/5409751/pexels-photo-5409751.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
  {
    id: 5,
    name: "Mary hey",
    content:
      "Build your product 10x faster and better with beUi's components. Just copy and paste!",
    title: "CFO, Company C",
    image:
      "https://images.pexels.com/photos/2258536/pexels-photo-2258536.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  },
];

const ShowCarousel = () => {
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Carousel${id}.tsx`).default;
    setCodeString(codeString);
  };
  return (
    <div className="flex flex-col">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-medium text-gray-500">
            Testimonial Infinite Carousel
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

        <div className="py-10 border border-gray-100 rounded-xl overflow-auto w-full">
          <Carousel1 testimonialData={testimonials} />
        </div>
      </div>

      <SlideOver
        isSlideOpen={showSlideOver}
        setIsSlideOpen={setShowSlideOver}
        title="Code"
      >
        <RenderCode code={codeString} />
      </SlideOver>
    </div>
  );
};

export default ShowCarousel;
