import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="relative md:pt-36 pt-20">
      <div className=" text-center mx-auto max-w-5xl">
        <p className="text-gray-500 font-semibold border rounded-full w-40 py-1 text-sm mx-auto cursor-pointer hover:text-gray-700/90 hover:border-gray-700/80 transition-colors duration-300">
          Copy. Paste. Use.
        </p>
        <h1 className="text-gray-800 font-bold text-4xl md:text-7xl mt-5">
          Build your website 10x faster with free UI components
        </h1>

        <h5 className="mt-4 max-w-2xl mx-auto font-medium text-gray-500">
          A collection of free, open-source UI components for your next project.
          Copy and paste the code snippets to use them in your project.
        </h5>

        <div className="mt-7 flex justify-center">
          <Link
            to="/components"
            className="relative before:shadow-lg flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-base font-semibold text-white">
              Explore Components
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
