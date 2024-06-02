import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    name: "Buttons",
    slug: "buttons",
  },
  {
    name: "Navbar",
    slug: "navbars",
  },
  {
    name: "Inputs",
    slug: "inputs",
  },
  {
    name: "Tabs",
    slug: "tabs",
  },

  {
    name: "Hero",
    slug: "hero",
  },
  {
    name: "Footer",
    slug: "footer",
  },
];

const Sidebar = () => {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex flex-col items-start space-y-1">
      {/* <p className="font-semibold text-xs text-gray-800 mb-2">All Components</p> */}
      {menuItems.map((item) => {
        return (
          <Link
            key={item.slug}
            to={item.slug}
            className={`font-medium text-sm transition-all duration-300 hover:text-gray-700 hover:translate-x-1 hover:bg-gray-100 px-4 py-1.5 rounded-lg hover:scale-95 ${
              pathname?.includes(item?.slug) ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
