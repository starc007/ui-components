"use client";

import { Button } from "@/components";
import { RenderCode, SlideOver } from "@/components/appComp";
import { useState } from "react";
import Button1 from "./Button1";
import Button2 from "./Button2";
import Button3 from "./Button3";
import ButtonVariants from "./ButtonVariants";

const buttonList = [
  {
    id: 1,
    comp: <Button1 />,
  },
  {
    id: 2,
    comp: <Button2 />,
  },
  {
    id: 3,
    comp: <Button3 />,
  },
];

const cmnDivClass =
  "flex justify-center items-center gap-4 h-40 rounded-xl bg-gray-50 mt-1 relative";

const ShowButtons = () => {
  const [showSlideOver, setShowSlideOver] = useState(false);

  const getCode = (id: number) => {
    const codeString = require(`!!raw-loader!./Button${id}.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");
    return filteredCode;
  };

  const getVariantCode = () => {
    const btnCodeTypesString =
      require(`!!raw-loader!../../UI/Button/button.types.ts`).default;
    const codeString =
      require(`!!raw-loader!../../UI/Button/button.main.tsx`).default;
    const filteredCode = codeString.split("\n").slice(1).join("\n");

    const code = `${btnCodeTypesString}\n${filteredCode}`;

    return code;
  };

  const btnVariantCode = getVariantCode();

  return (
    <div className="flex flex-col">
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {buttonList.map((item) => (
          <div key={item.id} className={cmnDivClass}>
            {item.comp}
            <button
              onClick={() => {
                const code = getCode(item.id);
                navigator.clipboard.writeText(code);
              }}
              className="absolute right-2 top-2 font-semibold text-xs border rounded-lg px-2 py-1"
            >
              Copy
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6">
        <h2 className="font-semibold">Button with different variants</h2>
        <button
          onClick={() => setShowSlideOver(true)}
          className="font-medium text-sm border px-4 py-1.5 rounded-lg"
        >
          View Code
        </button>
      </div>

      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <ButtonVariants />
      </div>

      <SlideOver
        isSlideOpen={showSlideOver}
        setIsSlideOpen={setShowSlideOver}
        title="Code"
      >
        <RenderCode code={btnVariantCode} />
      </SlideOver>
    </div>
  );
};

export default ShowButtons;
