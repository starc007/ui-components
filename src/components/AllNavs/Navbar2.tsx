import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const cmnClass =
  "text-gray-500 hover:text-gray-700 font-medium transition-all duration-300 text-sm";

const menuList = [
  {
    name: "Home",
    link: "#",
  },
  {
    name: "About",
    link: "#",
  },
  {
    name: "Services",
    link: "#",
  },
  {
    name: "Contact",
    link: "#",
  },
];

const Navbar2 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const variant = {
    open: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
      },
    },
    closed: {
      opacity: 0,
      rotateX: -15,
      transition: {
        duration: 0.5,
        delay: 0.3,
      },
    },
  };

  const handleClick = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between w-full">
      <div className="flex items-center gap-6">
        <a href="/" className="text-2xl font-bold">
          logo
        </a>
        <div className="hidden md:flex items-center gap-5">
          {menuList.map((item) => {
            return (
              <a key={item.name} href={item.link} className={cmnClass}>
                {item.name}
              </a>
            );
          })}
        </div>
      </div>
      <button className="bg-gray-800 hidden md:flex  text-white px-5 py-2 rounded-full text-sm font-medium">
        login
      </button>

      <div className="md:hidden block relative">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              ref={menuRef}
              initial="closed"
              animate={isOpen ? "open" : "closed"}
              variants={variant}
              className="flex flex-col gap-5 absolute top-8 w-48 border bg-white shadow-lg p-5 rounded-lg z-10 right-0"
            >
              {menuList.map((item) => {
                return (
                  <a key={item.name} href={item.link} className={cmnClass}>
                    {item.name}
                  </a>
                );
              })}
              <button className="bg-gray-800 text-white px-5 py-2 rounded-full text-sm font-medium">
                login
              </button>
            </motion.div>
          )}

          <button onClick={() => setIsOpen(!isOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar2;
