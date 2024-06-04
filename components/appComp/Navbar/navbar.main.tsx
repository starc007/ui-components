import logo from "@/assets/logo.svg";
import Image from "next/image";
import Link from "next/link";

const socials = [
  {
    icon: (
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
    ),
    link: "https://x.com/saurra3h",
  },
  {
    icon: (
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
    ),
    link: "https://linkedin.com/in/starc007",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6"
        viewBox="0 0 432 416"
      >
        <path
          fill="currentColor"
          d="M213.5 0q88.5 0 151 62.5T427 213q0 70-41 125.5T281 416q-14 2-14-11v-58q0-27-15-40q44-5 70.5-27t26.5-77q0-34-22-58q11-26-2-57q-18-5-58 22q-26-7-54-7t-53 7q-18-12-32.5-17.5T107 88h-6q-12 31-2 57q-22 24-22 58q0 55 27 77t70 27q-11 10-13 29q-42 18-62-18q-12-20-33-22q-2 0-4.5.5t-5 3.5t8.5 9q14 7 23 31q1 2 2 4.5t6.5 9.5t13 10.5T130 371t30-2v36q0 13-14 11q-64-22-105-77.5T0 213q0-88 62.5-150.5T213.5 0z"
        />
      </svg>
    ),
    link: "https://github.com/starc007/ui-components",
  },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 glass__bg h-16 py-3 px-4 z-10 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-semibold text-xl flex items-center">
          <Image src={logo} alt="beUi" className="w-6 inline-block mr-1" />
          beUi
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          {socials.map((social, i) => (
            <a
              key={i}
              href={social.link}
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 font-medium text-sm underline hover:text-gray-800 transition-all duration-300"
            >
              {social.icon}
            </a>
          ))}

          <a
            href="https://calendly.com/saurra3h/intro"
            target="_blank"
            rel="noreferrer nofollow"
            className="relative before:shadow-lg flex h-9 w-full items-center justify-center px-4 before:absolute before:inset-0 before:rounded-full before:bg-black before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-sm font-medium text-white">
              Hire me!
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
