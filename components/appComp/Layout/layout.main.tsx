import React from "react";

const Layout = (props: { children: React.ReactNode }) => {
  return (
    <div className="max-w-screen-xl mx-auto sm:px-4 px-2">{props.children}</div>
  );
};

export default Layout;
