import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="container mx-auto sticky top-0 glass__bg h-16 py-3 px-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="font-semibold text-xl">
          beUi
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <a
            href="https://x.com/saurra3h"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 font-medium text-sm underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M8.5 2h2.5L11 2h-2.5zM13 2h2.5L15.5 2h-2.5zM10.5 2h5v0h-5zM8.5 2h5v0h-5zM10 2h3.5L13.5 2h-3.5z"
              >
                <animate
                  fill="freeze"
                  attributeName="d"
                  dur="0.8s"
                  keyTimes="0;0.3;0.5;1"
                  values="M8.5 2h2.5L11 2h-2.5zM13 2h2.5L15.5 2h-2.5zM10.5 2h5v0h-5zM8.5 2h5v0h-5zM10 2h3.5L13.5 2h-3.5z;M8.5 2h2.5L11 22h-2.5zM13 2h2.5L15.5 22h-2.5zM10.5 2h5v2h-5zM8.5 20h5v2h-5zM10 2h3.5L13.5 22h-3.5z;M8.5 2h2.5L11 22h-2.5zM13 2h2.5L15.5 22h-2.5zM10.5 2h5v2h-5zM8.5 20h5v2h-5zM10 2h3.5L13.5 22h-3.5z;M1 2h2.5L18.5 22h-2.5zM5.5 2h2.5L23 22h-2.5zM3 2h5v2h-5zM16 20h5v2h-5zM18.5 2h3.5L5 22h-3.5z"
                />
              </path>
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/starc007"
            target="_blank"
            rel="noreferrer"
            className="text-gray-500 font-medium text-sm underline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M20.47 2H3.53a1.45 1.45 0 0 0-1.47 1.43v17.14A1.45 1.45 0 0 0 3.53 22h16.94a1.45 1.45 0 0 0 1.47-1.43V3.43A1.45 1.45 0 0 0 20.47 2ZM8.09 18.74h-3v-9h3ZM6.59 8.48a1.56 1.56 0 1 1 0-3.12a1.57 1.57 0 1 1 0 3.12Zm12.32 10.26h-3v-4.83c0-1.21-.43-2-1.52-2A1.65 1.65 0 0 0 12.85 13a2 2 0 0 0-.1.73v5h-3v-9h3V11a3 3 0 0 1 2.71-1.5c2 0 3.45 1.29 3.45 4.06Z"
              />
            </svg>
          </a>

          <a
            href="mailto:saurabh10102@gmail.com"
            className="relative before:shadow-lg flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-sm font-medium text-white">
              Contact
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
