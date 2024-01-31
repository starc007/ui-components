import { useEffect, useRef, useState } from "react";
import { SelectOptions } from "./select.types";
import SelectDropdown from "./select.dropdown";
import SelectItem from "./select.item";

const Select = (props: SelectOptions) => {
  const {
    wrapperClassName,
    label,
    error = false,
    errorText,
    required,
    options,
    isMulti,
    defaultSelectValue,
    disabled,
    placeholder = "Select...",
    onSelectChange,
  } = props;

  const selectRef = useRef<HTMLDivElement | null>(null);
  const [selectedOption, setSelectedOption] = useState<
    {
      label: string;
      value: string;
    }[]
  >(
    typeof defaultSelectValue !== "undefined" && defaultSelectValue !== null
      ? [...defaultSelectValue]
      : [{ label: "", value: "" }]
  );

  const [showSelectDropdown, setShowSelectDropdown] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectRef?.current?.contains(e.target as Node)) {
        return;
      }
      setShowSelectDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={wrapperClassName}>
      <label className="text-gray-800 text-sm placeholder-gray-800">
        {label} {required && <span className="text-red">*</span>}
      </label>
      <div
        ref={selectRef}
        className={`relative border transition duration-150 ease-in-out rounded-lg mt-1 flex justify-between items-center h-12 ${
          error
            ? "focus-within:border-red-600 border-red-600"
            : "focus-within:border-gray-700"
        } ${disabled && "bg-gray-100 cursor-not-allowed"}`}
        onClick={() => {
          if (disabled) return;
          setShowSelectDropdown((prevState) => !prevState);
        }}
      >
        <SelectItem
          error={error}
          selectedOption={selectedOption}
          showSelectDropdown={showSelectDropdown}
          placeholder={placeholder}
          defaultValue={defaultSelectValue}
          isMulti={isMulti}
          setSelectedOption={setSelectedOption}
          onChange={onSelectChange}
        />

        <SelectDropdown
          showSelectDropdown={showSelectDropdown}
          setShowSelectDropdown={setShowSelectDropdown}
          setSelectedOption={setSelectedOption}
          options={options}
          isMulti={isMulti}
          selectedOption={selectedOption}
          onChange={onSelectChange}
        />
      </div>
      {errorText && <p className="text-xs pt-1 text-red-700">{errorText}</p>}
    </div>
  );
};

export default Select;
