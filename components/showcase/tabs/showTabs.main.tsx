"use client";
import React, { useState } from "react";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";
import { RenderCode, SlideOver } from "@/components/appComp";
import Tab3 from "./Tab3";

const ShowTabs = () => {
  const [showSlider, setShowSlider] = useState(false);
  const [codeString, setCodeString] = useState("");

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Tab${id}.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");
    setCodeString(filteredCode);
  };

  return (
    <div className="flex flex-col">
      <p className="font-medium">Animated Tabs</p>

      {/* Tab3 */}
      <div className="flex justify-between items-center mt-5">
        <p className="text-sm text-primary">
          Tabs with content switch animation
        </p>
        <button
          onClick={() => {
            getCode(3);
            setShowSlider(true);
          }}
          className="text-sm border px-3 py-1.5 font-medium rounded-lg text-gray-600"
        >
          View code
        </button>
      </div>
      <div className="flex justify-center items-center py-16 border border-gray-100 rounded-xl mt-4">
        <Tab3 />
      </div>

      {/* Tab1 */}
      <div className="flex justify-between items-center mt-14">
        <p className="text-sm text-primary">Button shape tab</p>
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
      <div className="flex justify-center items-center py-6 border border-gray-100 rounded-xl mt-4">
        <Tab1 />
      </div>

      {/* Tab2 */}
      <div className="flex justify-between items-center mt-14">
        <p className="text-sm text-primary">Line tab</p>
        <button
          onClick={() => {
            getCode(2);
            setShowSlider(true);
          }}
          className="text-sm border px-3 py-1.5 font-medium rounded-lg text-gray-600"
        >
          View code
        </button>
      </div>
      <div className="flex justify-center items-center py-6 border border-gray-100 rounded-xl mt-4">
        <Tab2 />
      </div>

      <SlideOver isSlideOpen={showSlider} setIsSlideOpen={setShowSlider}>
        <RenderCode code={codeString} />
      </SlideOver>
    </div>
  );
};

export default ShowTabs;
