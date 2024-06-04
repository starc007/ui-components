import { Button } from "@/components/UI";
import React from "react";

const imgIcon = (
  <svg className="w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9s-9-1.8-9-9s1.8-9 9-9" />
      <path d="M8 13.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0" />
      <path d="M8 8h8v8" />
    </g>
  </svg>
);

const cmnDivClass =
  "flex justify-center items-center gap-4 h-40 rounded-xl bg-gray-50 mt-1 relative";

const ButtonVariants = () => {
  return (
    <>
      <div className="mt-3">
        <p className="text-gray-500 font-medium text-sm">
          Normal Button Preview
        </p>
        <div className={cmnDivClass}>
          <Button className="w-28 mt-2 h-10">Primary</Button>
          <Button variant="outline" className="w-28 mt-2 h-10">
            Outline
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-gray-500 font-medium text-sm">
          Button with Loader & disabled state
        </p>
        <div className={cmnDivClass}>
          <Button disabled showloading className="w-28 mt-2 h-10">
            Primary
          </Button>
          <Button showloading variant="outline" className="w-28 mt-2 h-10">
            Outline
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-gray-500 font-medium text-sm">
          Button with Left Icon
        </p>
        <div className={cmnDivClass}>
          <Button lefticon={imgIcon} className="w-min px-4 mt-2 h-10">
            Primary
          </Button>

          <Button
            lefticon={imgIcon}
            variant="outline"
            className="w-min px-4 mt-2 h-10"
          >
            Outline
          </Button>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-gray-500 font-medium text-sm">
          Button with Right Icon
        </p>
        <div className={cmnDivClass}>
          <Button righticon={imgIcon} className="w-min px-4 mt-2 h-10">
            Primary
          </Button>
          <Button
            variant="outline"
            righticon={imgIcon}
            className="w-min px-4 mt-2 h-10"
          >
            Primary
          </Button>
        </div>
      </div>
    </>
  );
};

export default ButtonVariants;
