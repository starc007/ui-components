"use client";
import React, { FC, useState } from "react";
import { motion } from "framer-motion";

interface TabItemProps {
  icon: React.ReactNode;
  isActive: boolean;
  setActiveTab: () => void;
  tabIndex: number;
}

interface TabProps {
  slug: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const tabColors: Record<number, Record<string, string>> = {
  1: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
  },
  2: {
    bg: "bg-pink-500/10",
    text: "text-pink-500",
  },
  3: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
  },
  4: {
    bg: "bg-green-500/10",
    text: "text-green-500",
  },
};

/**
 * Tab item component
 * Change it according to your need
 */
const TabItem = ({ icon, isActive, setActiveTab, tabIndex }: TabItemProps) => {
  return (
    <button
      className={`w-12 h-12 flex justify-center items-center text-sm font-medium transition-all relative ${
        isActive ? "text-white" : "text-zinc-500 hover:text-gray-800"
      }`}
      style={{
        WebkitTapHighlightColor: "transparent",
      }}
      onClick={() => setActiveTab()}
    >
      {isActive && (
        <motion.span
          layoutId="icon-tab"
          className={`absolute inset-0 z-0 rounded-full ${
            tabColors[tabIndex + 1].bg
          }`}
          transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
        />
      )}
      <span className={`relative z-10 ${tabColors[tabIndex + 1].text}`}>
        {icon}
      </span>
    </button>
  );
};

const Tab3: FC<{
  tabList: TabProps[];
}> = ({ tabList }) => {
  const [activeTab, setActiveTab] = useState(tabList[0].slug);
  const [tabs, setTabs] = useState(tabList);

  /**
   * Move tab to the first position in the tab list & set it as active tab
   * @param index - index of the tab to be moved
   */
  const moveTab = (index: number) => {
    const newTabList = [...tabList];
    const movedTab = newTabList.splice(index, 1);

    const selectedTabIndex = newTabList.findIndex(
      (tab) => tab.slug === activeTab
    );

    if (selectedTabIndex !== null && selectedTabIndex !== index) {
      const previouslySelectedTab = newTabList.splice(
        selectedTabIndex > index ? selectedTabIndex - 1 : selectedTabIndex,
        1
      )[0];
      newTabList.push(previouslySelectedTab);
    }

    newTabList.unshift(movedTab[0]);

    setTabs(newTabList);
    setActiveTab(newTabList[0].slug);
  };

  return (
    <div className="flex flex-col items-center relative w-full p-3">
      {/* Tab content */}
      <div className="mb-4 relative sm:w-96 w-full h-60">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.slug}
            layoutId={tab.slug}
            className="absolute bottom-0 left-0 w-full h-full"
            animate={tabs[0].slug === tab.slug ? "active" : "inactive"}
            initial="inactive"
            exit="inactive"
            variants={{
              active: {
                opacity: 1,
                scale: 1,
                zIndex: 1,
                top: 0,
              },
              inactive: {
                opacity: 1 - 0.2 * index,
                scale: 1 - 0.1 * index,
                zIndex: -index,
                top: -20 * index,
              },
            }}
          >
            {tab.content}
          </motion.div>
        ))}
      </div>
      <div className="flex gap-3">
        {tabList.map((tab, index) => (
          <TabItem
            key={index}
            icon={tab.icon}
            isActive={tabs[0].slug === tab.slug}
            setActiveTab={() => moveTab(index)}
            tabIndex={index}
          />
        ))}
      </div>
    </div>
  );
};

export default Tab3;
