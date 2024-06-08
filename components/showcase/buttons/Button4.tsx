"use client";
import React from "react";

const Button4 = () => {
  return (
    <button className="group flex items-center justify-center gap-1 h-10 px-6 bg-gray-100 transition duration-300 rounded-full w-max hover:ring-2 ring-gray-300 ring-offset-2">
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
  );
};

export default Button4;
