"use client";
import React, { useState } from "react";

const menuOptions = [
  {
    name: "Products",
    slug: "products",
  },
  {
    name: "Services",
    slug: "services",
  },
];

enum DIRECTION {
  LEFT = "left",
  RIGHT = "right",
}

const Dropdown1 = () => {
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [direction, setDirection] = useState<DIRECTION | null>(null);

  const handleMouseEnter = (idx: number) => {
    // console.log("idx", idx);
    // console.log("selectedTab", selectedTab);
    // console.log("typeof selectedTab", typeof selectedTab, typeof idx);

    if (selectedTab && idx) {
      setDirection(selectedTab > idx ? DIRECTION.RIGHT : DIRECTION.LEFT);
    }
    setSelectedTab(idx);
  };

  return (
    <div>
      <div
        onMouseLeave={() => setSelectedTab(null)}
        className="flex gap-4 relative"
      >
        {menuOptions.map((item, index) => {
          return (
            <button
              onMouseEnter={() => handleMouseEnter(index)}
              className={`flex items-center gap-1 text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300 ${
                selectedTab === index ? "text-gray-900" : "text-gray-500"
              }
              }`}
              key={item.slug}
            >
              {item.name}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 duration-500 ${
                  selectedTab === index ? "rotate-180" : ""
                }
                    `}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M4.47 9.4a.75.75 0 0 1 1.06 0l6.364 6.364a.25.25 0 0 0 .354 0L18.612 9.4a.75.75 0 0 1 1.06 1.06l-6.364 6.364a1.75 1.75 0 0 1-2.475 0L4.47 10.46a.75.75 0 0 1 0-1.06"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dropdown1;
