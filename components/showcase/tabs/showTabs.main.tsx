import React from "react";
import Tab1 from "./Tab1";
import Tab2 from "./Tab2";

const ShowTabs = () => {
  return (
    <div className="flex flex-col">
      <p className="font-medium">Animated Tabs</p>

      {/* Tab1 */}
      <div className="flex justify-end">
        <button className="text-sm border px-3 py-1.5 font-medium rounded-lg text-gray-600">
          View code
        </button>
      </div>
      <div className="flex justify-center items-center py-6 border border-gray-100 rounded-xl mt-4">
        <Tab1 />
      </div>

      {/* Tab2 */}
      <div className="flex justify-end">
        <button className="text-sm border px-3 py-1.5 font-medium rounded-lg text-gray-600">
          View code
        </button>
      </div>
      <div className="flex justify-center items-center py-6 border border-gray-100 rounded-xl mt-4">
        <Tab2 />
      </div>
    </div>
  );
};

export default ShowTabs;
