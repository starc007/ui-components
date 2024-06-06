"use client";

import { useRef } from "react";
import clsx from "clsx";
import { InputOptions } from "./input.types";

const Input = (props: InputOptions) => {
  const {
    id,
    wrapperClassName = "",
    inputClassName = "",
    labelClassName = "",
    placeholder = "",
    label = "",
    type = "text",
    error = false,
    errorText = "",
    isInputRequired = false,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={id}
        className={clsx("text-gray-600 text-sm", labelClassName)}
      >
        {label} {isInputRequired && <span className="text-red-600">*</span>}
      </label>
      <div
        className={`border transition duration-300 ease-in-out rounded-xl mt-1 ${
          error
            ? "focus-within:border-red-600 border-red-600"
            : "focus-within:border-gray-700"
        }`}
        onClick={() => inputRef?.current?.focus()}
      >
        <input
          ref={inputRef}
          type={type}
          className={clsx(
            "w-full px-2 h-11 text-gray-900 text-base rounded-xl focus:outline-none",
            inputClassName
          )}
          id={id}
          placeholder={placeholder}
          required={isInputRequired}
          {...rest}
        />
      </div>
      {errorText && <p className="text-xs pt-1 text-red-700">{errorText}</p>}
    </div>
  );
};

export default Input;
