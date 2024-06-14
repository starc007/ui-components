"use client";
import React, { useState } from "react";
import Accordian1 from "./Accordian1";
import { RenderCode, SlideOver } from "@/components/appComp";
import Accordian2 from "./Accordian2";

const accordianData = [
  {
    question: "What is beUi?",
    answer:
      "Its an free and open source component library for React & Next.js, Built with Tailwind CSS & Framer Motion.",
  },
  {
    question: "Is this the best component library?",
    answer:
      "Yes, it is the best component library. It is very easy to use and customize.",
  },
  {
    question: "Can I contribute to beUi?",
    answer:
      "Yes, you can contribute to beUi. You can also report bugs. Read the readme file for more information.",
  },
];

const ShowAccordian = () => {
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
          <h1 className="font-medium text-gray-500">Accordian 1</h1>
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
        <div className="border rounded-xl p-4">
          <Accordian1 accordianData={accordianData} />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-medium text-gray-500">Accordian 2</h1>
          <button
            onClick={() => {
              getCode(2);
              setShowSlideOver(true);
            }}
            className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
          >
            View code
          </button>
        </div>
        <div className="border rounded-xl p-4">
          <Accordian2 accordianData={accordianData} />
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

export default ShowAccordian;
