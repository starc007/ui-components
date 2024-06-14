import React, { FC, useRef } from "react";

interface AccordianProps {
  accordianData: {
    question: string;
    answer: string;
  }[];
}

const AccordianItem: FC<{
  question: string;
  answer: string;
  isLastElement: boolean;
}> = ({ question, answer, isLastElement }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className={`border-gray-200 ${isLastElement ? "" : "border-b"} py-2`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full"
      >
        <h1 className="font-medium text-gray-700">{question}</h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-5 transition-all duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        style={{
          height: isOpen ? ref.current?.offsetHeight || 0 : 0,
        }}
        className={`text-gray-500 text-sm pt-1 duration-300 overflow-hidden transition-all ease-in `}
      >
        <p className="pb-2" ref={ref}>
          {answer}
        </p>
      </div>
    </div>
  );
};

const Accordian1: FC<AccordianProps> = ({ accordianData }) => {
  return (
    <div className="flex flex-col space-y-4">
      {accordianData.map((item, index) => (
        <AccordianItem
          key={index}
          question={item.question}
          answer={item.answer}
          isLastElement={index === accordianData.length - 1}
        />
      ))}
    </div>
  );
};

export default Accordian1;
