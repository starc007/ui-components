import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    name: "Buttons",
    slug: "buttons",
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
    name: "Navbar",
    slug: "navbars",
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
    <div className="flex flex-col items-start space-y-3">
      <p className="font-semibold text-sm text-gray-800">All Components</p>
      {menuItems.map((item) => {
        return (
          <Link
            key={item.slug}
            to={item.slug}
            className={`font-medium transition-all duration-300 hover:text-gray-700 hover:translate-x-1 ${
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
