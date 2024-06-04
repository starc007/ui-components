"use client";
import React from "react";

const Button1 = () => {
  return (
    <button className="relative before:shadow-lg flex h-10 items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 w-max">
      <span className="relative text-base font-semibold text-white">
        hover me
      </span>
    </button>
  );
};

export default Button1;
