import React from "react";

const ShowDropdown = () => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">Dropdown on Hover</p>
        <button
          onClick={() => {
            // getCode(1);
            // setIsSliderOpen(true);
          }}
          className="bg-primary/10 px-3 p-2 rounded-lg text-primary font-medium text-sm"
        >
          View code
        </button>
      </div>
      <div className="mt-3 flex items-center justify-center py-8 border border-gray-200 rounded-xl">
        <h1 className="sm:text-4xl text-2xl font-semibold text-gray-400">
          Dropdown1
        </h1>
      </div>
    </div>
  );
};

export default ShowDropdown;
