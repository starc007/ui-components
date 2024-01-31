import React from "react";

const Layout = (props: { children: React.ReactNode }) => {
  return <div className="max-w-screen-xl mx-auto px-4">{props.children}</div>;
};

export default Layout;
