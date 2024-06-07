"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const tabList = [
  {
    title: "Home",
    content: "Tab1 content",
  },
  {
    title: "Component",
    content: "Tab2 content",
  },
  {
    title: "About",
    content: "Tab3 content",
  },
];

interface TabItemProps {
  title: string;
  isActive: boolean;
  setActiveTab: () => void;
}

const TabItem = ({ title, isActive, setActiveTab }: TabItemProps) => {
  return (
    <button
      className={`py-2 text-sm font-medium transition-all relative ${
        isActive ? "text-blue-500" : "text-zinc-500 hover:text-gray-800"
      }`}
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
      onClick={() => setActiveTab()}
    >
      {isActive && (
        <motion.span
          layoutId="line-tab"
          className="absolute left-0 right-0 bottom-0 z-0 border-b-2 border-blue-500"
          transition={{
            type: "spring",
            bounce: 0.3,
            duration: 0.4,
            delay: 0.1,
          }}
        />
      )}
      <span className="relative z-10">{title}</span>
    </button>
  );
};

const Tab2 = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex flex-col">
      <div className="flex gap-8">
        {tabList.map((tab, index) => (
          <TabItem
            key={index}
            title={tab.title}
            isActive={activeTab === index}
            setActiveTab={() => setActiveTab(index)}
          />
        ))}
      </div>
      {/* Tab content */}
      {/* <div className="p-4 bg-gray-100 rounded-lg mt-4">
        {tabList[activeTab].content}
      </div> */}
    </div>
  );
};

export default Tab2;
