"use client";

import { useRef } from "react";
import { InputOptions } from "./input.types";

const Input = (props: InputOptions) => {
  const {
    id,
    wrapperClassName = "",
    placeholder = "",
    label = "",
    type = "text",
    error = false,
    errorText = "",
    required = false,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="text-gray-800 text-sm">
        {label} {required && <span className="text-red">*</span>}
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
          className="w-full px-2 h-11 text-gray-900 text-base rounded-xl focus:outline-none"
          id={id}
          placeholder={placeholder}
          {...rest}
        />
      </div>
      {errorText && <p className="text-xs pt-1 text-red-700">{errorText}</p>}
    </div>
  );
};

export default Input;
