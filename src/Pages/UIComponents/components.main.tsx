import { Sidebar } from "@/components";
import { Outlet } from "react-router-dom";

const UIComponents = () => {
  return (
    <div className="flex gap-4 h-[calc(100vh-4rem)]">
      <div className="md:w-36 md:block hidden  border-r-gray-100  pt-5">
        <Sidebar />
      </div>
      <div className="border border-gray-100 w-full rounded-2xl md:px-6 px-3 py-4 md:mb-10 mb-5 mt-2 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default UIComponents;
