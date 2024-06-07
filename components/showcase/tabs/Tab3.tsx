"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Change it according to your need
const tabList = [
  {
    slug: "home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6"
        viewBox="0 0 24 24"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.75 8.917h18.5"
          />
          <rect width="18.5" height="18.5" x="2.75" y="2.75" rx="6" />
        </g>
      </svg>
    ),
    content: (
      <div className="ring-2 ring-cyan-500/20 bg-cyan-50 text-cyan-500 rounded-xl h-60 flex justify-center items-center ">
        Tab1 content
      </div>
    ),
  },
  {
    slug: "component",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M21.25 7.889V5.833a3.083 3.083 0 0 0-3.083-3.083h-3.084m0 18.5h3.084a3.083 3.083 0 0 0 3.083-3.083V16.11m-18.5.001v2.056a3.083 3.083 0 0 0 3.083 3.083h3.084m0-18.5H5.833A3.083 3.083 0 0 0 2.75 5.833V7.89m10.109-3.557l-6.476 8.76a.57.57 0 0 0-.098.228a.514.514 0 0 0 0 .253a.465.465 0 0 0 .155.196a.408.408 0 0 0 .22.065h4.894l-.742 5.71a.171.171 0 0 0 0 .105a.163.163 0 0 0 .073.074a.139.139 0 0 0 .098 0a.128.128 0 0 0 .09-.057l6.475-8.76a.562.562 0 0 0 .098-.236a.496.496 0 0 0-.195-.44a.408.408 0 0 0-.22-.066h-4.894l.742-5.71a.171.171 0 0 0 0-.105a.163.163 0 0 0-.074-.074a.139.139 0 0 0-.097 0a.13.13 0 0 0-.05.057"
        />
      </svg>
    ),
    content: (
      <div className="ring-2 ring-pink-500/20 bg-pink-50 text-pink-500 rounded-xl h-60 flex justify-center items-center">
        Tab2 content
      </div>
    ),
  },
  {
    slug: "about",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12.62 2.762A7.453 7.453 0 0 0 12 2.75c-2.378 0-4.086.002-5.386.176c-1.279.172-2.05.5-2.62 1.069c-.569.57-.896 1.34-1.068 2.619c-.174 1.3-.176 3.008-.176 5.386s.002 4.086.176 5.386c.172 1.279.5 2.05 1.069 2.62c.57.569 1.34.896 2.619 1.068c1.3.174 3.008.176 5.386.176s4.086-.002 5.386-.176c1.279-.172 2.05-.5 2.62-1.069c.569-.57.896-1.34 1.068-2.619c.174-1.3.176-3.008.176-5.386c0-.353 0-.487-.012-.62a3.293 3.293 0 0 0-.749-1.807a7.673 7.673 0 0 0-.439-.457L14.884 3.95a7.718 7.718 0 0 0-.457-.44a3.292 3.292 0 0 0-1.806-.748Zm-.588-1.512c.311 0 .512 0 .719.018a4.79 4.79 0 0 1 2.64 1.094c.16.133.305.279.53.504l.024.023l5.19 5.19c.224.225.37.37.503.53a4.791 4.791 0 0 1 1.094 2.64c.018.207.018.408.018.72v.088c0 2.309 0 4.118-.19 5.53c-.194 1.444-.6 2.584-1.494 3.479c-.895.895-2.035 1.3-3.48 1.494c-1.411.19-3.22.19-5.529.19h-.114c-2.309 0-4.118 0-5.53-.19c-1.444-.194-2.584-.6-3.479-1.494c-.895-.895-1.3-2.035-1.494-3.48c-.19-1.411-.19-3.22-.19-5.529v-.114c0-2.309 0-4.118.19-5.53c.194-1.444.6-2.584 1.494-3.479c.895-.895 2.035-1.3 3.48-1.494c1.411-.19 3.22-.19 5.529-.19h.088Zm-.57 10h1.076c.67 0 1.229 0 1.681.046c.474.048.913.153 1.309.418c.3.2.558.458.758.758c.265.396.37.836.418 1.309c.046.452.046 1.011.046 1.68v.077c0 .67 0 1.229-.046 1.681c-.048.473-.153.913-.418 1.309c-.2.3-.458.558-.758.759c-.396.264-.835.369-1.309.417c-.452.046-1.011.046-1.68.046h-1.077c-.67 0-1.229 0-1.681-.046c-.473-.048-.913-.153-1.309-.418a2.75 2.75 0 0 1-.759-.758c-.264-.396-.369-.835-.417-1.309c-.046-.452-.046-1.011-.046-1.68v-.077c0-.67 0-1.229.046-1.681c.048-.473.153-.913.417-1.309c.201-.3.459-.558.76-.758c.395-.265.835-.37 1.308-.418c.452-.046 1.011-.046 1.68-.046Zm-1.53 1.538c-.354.036-.518.1-.626.173a1.251 1.251 0 0 0-.345.345c-.073.108-.137.272-.173.627c-.037.367-.038.85-.038 1.567c0 .718 0 1.2.038 1.567c.036.355.1.519.173.628c.09.136.208.253.345.344c.108.073.272.137.627.173c.323.033.734.037 1.317.038v-5.5c-.583 0-.994.005-1.317.038Zm2.818-.038v2h2.497a9.365 9.365 0 0 0-.035-.817c-.036-.355-.1-.519-.173-.627a1.25 1.25 0 0 0-.345-.345c-.108-.073-.272-.137-.627-.173c-.323-.033-.734-.037-1.317-.038Zm2.497 3.5H12.75v2c.583 0 .994-.005 1.317-.038c.355-.036.519-.1.627-.173a1.25 1.25 0 0 0 .345-.345c.073-.108.137-.272.173-.627a9.32 9.32 0 0 0 .035-.817Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    content: (
      <div className="ring-2 ring-amber-500/20 bg-amber-50 text-amber-500 rounded-xl h-60 flex justify-center items-center">
        Tab3 content
      </div>
    ),
  },
  {
    slug: "explore",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M12.62 2.762A7.453 7.453 0 0 0 12 2.75c-2.378 0-4.086.002-5.386.176c-1.279.172-2.05.5-2.62 1.069c-.569.57-.896 1.34-1.068 2.619c-.174 1.3-.176 3.008-.176 5.386s.002 4.086.176 5.386c.172 1.279.5 2.05 1.069 2.62c.57.569 1.34.896 2.619 1.068c1.3.174 3.008.176 5.386.176s4.086-.002 5.386-.176c1.279-.172 2.05-.5 2.62-1.069c.569-.57.896-1.34 1.068-2.619c.174-1.3.176-3.008.176-5.386c0-.353 0-.487-.012-.62a3.293 3.293 0 0 0-.749-1.807a7.673 7.673 0 0 0-.439-.457L14.884 3.95a7.718 7.718 0 0 0-.457-.44a3.292 3.292 0 0 0-1.806-.748Zm-.588-1.512c.311 0 .512 0 .719.018a4.79 4.79 0 0 1 2.64 1.094c.16.133.305.279.53.504l.024.023l5.19 5.19c.224.225.37.37.503.53a4.791 4.791 0 0 1 1.094 2.64c.018.207.018.408.018.72v.088c0 2.309 0 4.118-.19 5.53c-.194 1.444-.6 2.584-1.494 3.479c-.895.895-2.035 1.3-3.48 1.494c-1.411.19-3.22.19-5.529.19h-.114c-2.309 0-4.118 0-5.53-.19c-1.444-.194-2.584-.6-3.479-1.494c-.895-.895-1.3-2.035-1.494-3.48c-.19-1.411-.19-3.22-.19-5.529v-.114c0-2.309 0-4.118.19-5.53c.194-1.444.6-2.584 1.494-3.479c.895-.895 2.035-1.3 3.48-1.494c1.411-.19 3.22-.19 5.529-.19h.088Zm-.57 10h1.076c.67 0 1.229 0 1.681.046c.474.048.913.153 1.309.418c.3.2.558.458.758.758c.265.396.37.836.418 1.309c.046.452.046 1.011.046 1.68v.077c0 .67 0 1.229-.046 1.681c-.048.473-.153.913-.418 1.309c-.2.3-.458.558-.758.759c-.396.264-.835.369-1.309.417c-.452.046-1.011.046-1.68.046h-1.077c-.67 0-1.229 0-1.681-.046c-.473-.048-.913-.153-1.309-.418a2.75 2.75 0 0 1-.759-.758c-.264-.396-.369-.835-.417-1.309c-.046-.452-.046-1.011-.046-1.68v-.077c0-.67 0-1.229.046-1.681c.048-.473.153-.913.417-1.309c.201-.3.459-.558.76-.758c.395-.265.835-.37 1.308-.418c.452-.046 1.011-.046 1.68-.046Zm-1.53 1.538c-.354.036-.518.1-.626.173a1.251 1.251 0 0 0-.345.345c-.073.108-.137.272-.173.627c-.037.367-.038.85-.038 1.567c0 .718 0 1.2.038 1.567c.036.355.1.519.173.628c.09.136.208.253.345.344c.108.073.272.137.627.173c.323.033.734.037 1.317.038v-5.5c-.583 0-.994.005-1.317.038Zm2.818-.038v2h2.497a9.365 9.365 0 0 0-.035-.817c-.036-.355-.1-.519-.173-.627a1.25 1.25 0 0 0-.345-.345c-.108-.073-.272-.137-.627-.173c-.323-.033-.734-.037-1.317-.038Zm2.497 3.5H12.75v2c.583 0 .994-.005 1.317-.038c.355-.036.519-.1.627-.173a1.25 1.25 0 0 0 .345-.345c.073-.108.137-.272.173-.627a9.32 9.32 0 0 0 .035-.817Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    content: (
      <div className="ring-2 ring-green-500/20 bg-green-50 text-green-500 rounded-xl h-60 flex justify-center items-center">
        Tab4 content
      </div>
    ),
  },
];

interface TabItemProps {
  icon: React.ReactNode;
  isActive: boolean;
  setActiveTab: () => void;
  tabIndex: number;
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

const Tab3 = () => {
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
    <div className="flex flex-col items-center relative">
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
