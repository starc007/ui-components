import React from "react";
import { SelectItemProps } from "./select.types";

const SelectItem: React.FC<SelectItemProps> = ({
  error,
  selectedOption,
  showSelectDropdown,
  placeholder,
  defaultValue,
  isMulti = false,
  setSelectedOption,
  onChange,
}) => {
  const isDefaultValue =
    typeof defaultValue !== "undefined" &&
    defaultValue?.length > 0 &&
    defaultValue !== null &&
    selectedOption.length === 0;

  const getContent = (
    options: {
      label: string;
      value: string;
    }[]
  ) => {
    let content = null;
    if (!isMulti) {
      content = options.map((it) => <span key={it.value}>{it.label}</span>);
    } else {
      content = options.map((it) => (
        <span
          key={it.value}
          className="bg-gray-200 text-gray-800 rounded-full px-3 py-1 flex items-center"
        >
          {it.label}
          <span
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              const newSelectedOption = selectedOption.filter(
                (prevOption) => prevOption.value !== it.value
              );
              setSelectedOption(newSelectedOption);
              onChange && onChange(newSelectedOption);
            }}
          >
            <svg
              className="w-3 ml-1 text-gray-600"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                fill-rule="evenodd"
                d="M4.28 3.22a.75.75 0 0 0-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06L8 9.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L9.06 8l3.72-3.72a.75.75 0 0 0-1.06-1.06L8 6.94z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </span>
      ));
    }
    return content;
  };

  return (
    <>
      <div
        className={`${
          error ? "text-red-600" : "text-gray-900"
        } text-sm rounded-md px-3 flex flex-wrap gap-2`}
      >
        {isDefaultValue
          ? getContent(defaultValue)
          : selectedOption.length > 0
          ? getContent(selectedOption)
          : placeholder}
      </div>
      <svg
        className={`${
          showSelectDropdown
            ? "transform rotate-180 duration-500"
            : "duration-500"
        } w-4 text-gray-600 mr-2`}
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M104.704 338.752a64 64 0 0 1 90.496 0l316.8 316.8l316.8-316.8a64 64 0 0 1 90.496 90.496L557.248 791.296a64 64 0 0 1-90.496 0L104.704 429.248a64 64 0 0 1 0-90.496"
        />
      </svg>
    </>
  );
};

export default SelectItem;
