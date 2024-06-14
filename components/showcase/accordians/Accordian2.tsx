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
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={`border-gray-100 ${
        isLastElement ? "" : "border-b"
      } py-2 cursor-pointer`}
    >
      <div className="flex items-center justify-between w-full">
        <h1 className="font-medium text-gray-700 sm:text-base text-sm">
          {question}
        </h1>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`sm:w-5 w-4 transition-all duration-500 text-gray-500 ${
            isOpen ? "rotate-45" : ""
          }`}
          viewBox="0 0 56 56"
        >
          <path
            fill="currentColor"
            d="M27.988 47.734c1.149 0 2.11-.914 2.11-2.039V30.11h15.14c1.125 0 2.11-.96 2.11-2.109c0-1.148-.985-2.086-2.11-2.086h-15.14v-15.61c0-1.124-.961-2.038-2.11-2.038c-1.148 0-2.086.914-2.086 2.039v15.61h-15.14c-1.125 0-2.11.937-2.11 2.085s.985 2.11 2.11 2.11h15.14v15.585c0 1.125.938 2.04 2.086 2.04"
          />
        </svg>
      </div>
      <div
        style={{
          height: isOpen ? ref.current?.offsetHeight || 0 : 0,
        }}
        className={`text-gray-500 sm:text-sm text-xs pt-1 duration-300 overflow-hidden transition-all ease-in `}
      >
        <p ref={ref} className="pb-2">
          {answer}
        </p>
      </div>
    </div>
  );
};

const Accordian2: FC<AccordianProps> = ({ accordianData }) => {
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

export default Accordian2;
