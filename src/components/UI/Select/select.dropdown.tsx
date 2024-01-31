import React, { FC } from "react";
import { SelectDropdownProps } from "./select.types";

const SelectDropdown: FC<SelectDropdownProps> = ({
  showSelectDropdown,
  setShowSelectDropdown,
  setSelectedOption,
  options,
  isMulti,
  selectedOption,
  onChange,
}) => {
  const handleSelect = (
    e: React.MouseEvent<HTMLLIElement, MouseEvent>,
    option: {
      label: string;
      value: string;
    }
  ) => {
    e.stopPropagation();
    if (isMulti) {
      const isOptionSelected = selectedOption.some(
        (prevOption) => prevOption.value === option.value
      );

      let newOptions;

      if (isOptionSelected) {
        newOptions = selectedOption.filter(
          (prevOption) => prevOption.value !== option.value
        );
      } else {
        newOptions = [...selectedOption, option];
      }

      setSelectedOption(newOptions);
      onChange && onChange(newOptions);
    } else {
      setSelectedOption([option]);
      onChange && onChange([option]);
      setShowSelectDropdown(false);
    }
  };

  return (
    <div
      className={`${
        showSelectDropdown ? "block slide-in" : "hidden slide-out"
      } absolute top-12 w-full mt-1 bg-white rounded-md shadow-md border`}
    >
      <ul className="py-1">
        {options.map((option) => {
          const isOptionSelected = selectedOption.some(
            (prevOption) => prevOption.value === option.value
          );
          return (
            <li
              key={option.value}
              className={`px-2 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                isOptionSelected && "bg-gray-100"
              }`}
              onClick={(e) => handleSelect(e, option)}
            >
              {option.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SelectDropdown;
