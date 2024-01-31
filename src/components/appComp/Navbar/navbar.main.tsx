/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";

// const MenuItems = [
//   {
//     id: 1,
//     name: "Explore",
//     link: "/explore",
//   },
//   {
//     id: 2,
//     name: "Login",
//     link: "/login",
//   },
// ];

const Navbar = () => {
  return (
    <header className="bg-white">
      <div className="">
        <div className="flex items-center justify-between h-16 lg:h-[72px]">
          <Link to="/" title="" className="text-2xl font-bold">
            UI Components
          </Link>

          {/* <div className="hidden lg:flex lg:justify-start lg:ml-16 lg:space-x-8 xl:space-x-14">
            {MenuItems.map((item) => (
              <Link
                to={item.link}
                key={item.id}
                className="text-base font-semibold text-gray-900 transition-all duration-200 hover:text-gray-700"
              >
                {item.name}
              </Link>
            ))}
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
