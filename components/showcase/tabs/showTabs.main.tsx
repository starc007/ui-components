import React from "react";
import Tab1 from "./Tab1";

const ShowTabs = () => {
  return (
    <div className="flex flex-col">
      <p className="font-medium">Animated Tabs</p>

      <div className="flex justify-center items-center py-6 border border-gray-100 rounded-xl mt-4">
        <Tab1 />
      </div>
    </div>
  );
};

export default ShowTabs;
