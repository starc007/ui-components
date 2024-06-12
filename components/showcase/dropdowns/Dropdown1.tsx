"use client";
import React, { FC, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const menuOptions = [
  {
    name: "Products",
    slug: "products",
    comp: (
      <div className="flex flex-col items-center gap-4">
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Product 1
        </button>
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Product 2
        </button>
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Product 3
        </button>
      </div>
    ),
  },
  {
    name: "Services",
    slug: "services",
    comp: (
      <div className="flex flex-col items-center gap-4">
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Service 1
        </button>
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Service 2
        </button>
        <button className="text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300">
          Service 3
        </button>
      </div>
    ),
  },
];

interface DropDownContentProps {
  selectedTab: number;
}

const DropDownContent: FC<DropDownContentProps> = ({ selectedTab }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveTriangle();
  }, [selectedTab]);

  const moveTriangle = () => {
    if (selectedTab !== null) {
      const hoveredTab = document.getElementById(`tab-${selectedTab}`);
      const dropdownContent = document.getElementById("dropdown-content");

      if (!hoveredTab || !dropdownContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeftPosition } =
        dropdownContent.getBoundingClientRect();

      const tabCenterPosition =
        tabRect.left + tabRect.width / 2 - contentLeftPosition;

      setLeft(tabCenterPosition);
    }
  };

  return (
    <motion.div
      id="dropdown-content"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
      className="absolute top-[calc(100%_+_20px)] w-64 rounded-lg border shadow-md bg-white p-4"
    >
      <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />

      <motion.span
        style={{
          clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
        }}
        animate={{ left }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-tl border bg-white"
      />

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {menuOptions[selectedTab].comp}
      </motion.div>
    </motion.div>
  );
};

const DropdownTab: FC<{
  selectedTab: number;
  idx: number;
  name: string;
  handleMouseEnter: (idx: number) => void;
}> = ({ selectedTab, idx, name, handleMouseEnter }) => {
  return (
    <button
      id={`tab-${idx}`}
      onMouseEnter={() => handleMouseEnter(idx)}
      className={`flex items-center gap-1 text-sm font-medium hover hover:bg-gray-50 px-3 py-2 rounded-lg duration-300 ${
        selectedTab === idx ? "text-gray-900" : "text-gray-500"
      }`}
    >
      {name}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-3.5 duration-500 ${
          selectedTab === idx ? "rotate-180" : ""
        }`}
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
};

const Dropdown1 = () => {
  const [selectedTab, setSelectedTab] = useState<number | null>(null);

  return (
    <div>
      <div
        onMouseLeave={() => setSelectedTab(null)}
        className="flex gap-4 relative"
      >
        {menuOptions.map((item, index) => {
          return (
            <DropdownTab
              key={item.slug}
              selectedTab={selectedTab!}
              idx={index}
              name={item.name}
              handleMouseEnter={() => setSelectedTab(index)}
            />
          );
        })}
        <AnimatePresence>
          {selectedTab !== null && (
            <DropDownContent selectedTab={selectedTab} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dropdown1;
