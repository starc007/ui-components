"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const tabList = [
  {
    title: "Tab1",
    content: "Tab1 content",
  },
  {
    title: "Tab2",
    content: "Tab2 content",
  },
  {
    title: "Tab3",
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
      className={`w-20 h-10 text-sm font-medium transition-all relative ${
        isActive ? "text-white" : "text-zinc-500 hover:text-gray-800"
      }`}
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
      onClick={() => setActiveTab()}
    >
      {isActive && (
        <motion.span
          layoutId="bubble-tab"
          className="absolute inset-0 z-0 bg-primary rounded-lg"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10">{title}</span>
    </button>
  );
};

const Tab1 = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {tabList.map((tab, index) => (
        <TabItem
          key={index}
          title={tab.title}
          isActive={activeTab === index}
          setActiveTab={() => setActiveTab(index)}
        />
      ))}

      {/* Tab content */}
      {/* <div className="p-4 bg-gray-100 rounded-lg mt-4">
        {tabList[activeTab].content}
      </div> */}
    </div>
  );
};

export default Tab1;
