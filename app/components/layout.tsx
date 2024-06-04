import { Sidebar } from "@/components";
import React from "react";

const ComponentsLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex gap-4 h-[calc(100vh-4rem)]">
      <div className="md:w-56 md:block hidden  border-r-gray-100  pt-5">
        <Sidebar />
      </div>
      <div className="border border-gray-100 w-full rounded-2xl md:px-6 px-3 py-4 md:mb-10 mb-5 mt-2 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default ComponentsLayout;
