import { Button } from "@/components";
import { RenderCode, SlideOver } from "@/components/appComp";
import { useState } from "react";
import { AllButtons } from "./AllButtons";

const ButtonList = [
  {
    id: 1,
    html: `<button className="relative before:shadow-lg flex h-10 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max">
            <span className="relative text-base font-semibold text-white">
              hover me
            </span>
          </button>`,
  },
  {
    id: 2,
    html: ` <button className="group flex items-center justify-center gap-1 h-10 w-full px-6 hover:bg-gray-200 transition duration-300 rounded-full sm:w-max">
            Hover me
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 group-hover:translate-x-1 transition duration-300 text-gray-700"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m20 12l.707-.707l.707.707l-.707.707zM5 13a1 1 0 1 1 0-2zm9.707-7.707l6 6l-1.414 1.414l-6-6zm6 7.414l-6 6l-1.414-1.414l6-6zM20 13H5v-2h15z"
              />
            </svg>
          </button>`,
  },
  {
    id: 3,
    html: ` <button className="group flex items-center justify-center gap-1 h-10 w-full px-6 bg-gradient-to-t from-gray-800 to-gray-500 text-white font-medium rounded-lg sm:w-max ring-2 ring-gray-400">
            Button
          </button>`,
  },
];

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

const Buttons = () => {
  const [showSlideOver, setShowSlideOver] = useState(false);

  return (
    <div className="flex flex-col">
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className={cmnDivClass}>
          <button className="relative before:shadow-lg flex h-10 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max">
            <span className="relative text-base font-semibold text-white">
              hover me
            </span>
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(ButtonList[0].html)}
            className="absolute right-2 top-2 font-semibold text-xs border rounded-lg px-2 py-1"
          >
            Copy
          </button>
        </div>
        <div className={cmnDivClass}>
          <button className="group flex items-center justify-center gap-1 h-10 w-full px-6 hover:bg-gray-200 transition duration-300 rounded-full sm:w-max">
            Hover me
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 group-hover:translate-x-1 transition duration-300 text-gray-700"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m20 12l.707-.707l.707.707l-.707.707zM5 13a1 1 0 1 1 0-2zm9.707-7.707l6 6l-1.414 1.414l-6-6zm6 7.414l-6 6l-1.414-1.414l6-6zM20 13H5v-2h15z"
              />
            </svg>
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(ButtonList[1].html)}
            className="absolute right-2 top-2 font-semibold text-xs border rounded-lg px-2 py-1"
          >
            Copy
          </button>
        </div>
        <div className={cmnDivClass}>
          <button className="group flex items-center justify-center gap-1 h-10 w-full px-6 bg-gradient-to-t from-gray-800 to-gray-500 text-white font-medium rounded-lg sm:w-max ring-2 ring-gray-400">
            Button
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(ButtonList[2].html)}
            className="absolute right-2 top-2 font-semibold text-xs border rounded-lg px-2 py-1"
          >
            Copy
          </button>
        </div>
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
      </div>

      <SlideOver
        isSlideOpen={showSlideOver}
        setIsSlideOpen={setShowSlideOver}
        title="Code"
      >
        <RenderCode code={AllButtons[1]} />
      </SlideOver>
    </div>
  );
};

export default Buttons;
