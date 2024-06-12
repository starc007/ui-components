"use client";
import React, { useState } from "react";
import Dropdown1 from "./Dropdown1";
import { RenderCode, SlideOver } from "@/components/appComp";

const ShowDropdown = () => {
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Dropdown${id}.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");
    setCodeString(filteredCode);
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Dropdown on Hover</p>
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
      <div className="mt-3 flex items-center justify-center py-8 border border-gray-200 rounded-xl">
        <Dropdown1 />
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

export default ShowDropdown;
