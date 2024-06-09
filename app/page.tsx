"use client";

import { Footer } from "@/components/appComp";
import { motion } from "framer-motion";
import gradBg from "@/assets/gradBg.jpg";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <section className="relative md:pt-24 pt-20">
      <Image
        src={gradBg}
        alt="bg"
        className="absolute top-0 -z-10 opacity-30 left-0 w-full h-full object-contain" // bg image
      />
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mx-auto max-w-5xl"
      >
        <p className="text-gray-500 font-semibold border rounded-full w-max px-3 py-1 text-sm mx-auto cursor-pointer hover:text-gray-700/90 hover:border-gray-700/80 transition-colors duration-300">
          build better. build faster.
        </p>
        <h1 className="text-gray-600 font-bold text-3xl sm:text-5xl lg:text-7xl mt-5">
          Build your website 10x faster with
          <span className="inline-block mt-4 -rotate-1 bg-gray-800/10 text-gray-800 px-4 py-2 rounded ml-2">
            <span className="block rotate-1"> free UI components</span>
          </span>{" "}
        </h1>

        <h5 className="mt-4 max-w-2xl mx-auto font-medium text-gray-500">
          A collection of free, open-source UI components for your next project.
          Copy and paste the code snippets to use them in your project.
        </h5>

        <div className="mt-7 flex flex-wrap justify-center items-center gap-4">
          <Link
            href="/components/buttons"
            className="relative before:shadow-lg flex h-12 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-xl before:bg-gray-800 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max hover:before:ring-2 before:ring-gray-800 before:ring-offset-2"
          >
            <span className="relative text-base font-semibold text-white">
              Explore Components
            </span>
          </Link>
          <Link
            href="https://github.com/starc007/ui-components"
            target="_blank"
            rel="noreferrer nofollow noopener"
            className="flex justify-center items-center gap-2 font-medium text-gray-700 bg-gray-100 rounded-xl px-6 h-12 sm:w-max w-full hover:ring-2 ring-gray-300 ring-offset-2 duration-300"
          >
            Star on GitHub
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5"
              viewBox="0 0 432 416"
            >
              <path
                fill="currentColor"
                d="M213.5 0q88.5 0 151 62.5T427 213q0 70-41 125.5T281 416q-14 2-14-11v-58q0-27-15-40q44-5 70.5-27t26.5-77q0-34-22-58q11-26-2-57q-18-5-58 22q-26-7-54-7t-53 7q-18-12-32.5-17.5T107 88h-6q-12 31-2 57q-22 24-22 58q0 55 27 77t70 27q-11 10-13 29q-42 18-62-18q-12-20-33-22q-2 0-4.5.5t-5 3.5t8.5 9q14 7 23 31q1 2 2 4.5t6.5 9.5t13 10.5T130 371t30-2v36q0 13-14 11q-64-22-105-77.5T0 213q0-88 62.5-150.5T213.5 0z"
              />
            </svg>
          </Link>
        </div>

        <div className="flex justify-center flex-wrap items-center gap-5 mt-10">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-9 w-8 text-gray-500"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033c-3.407.306-6.6 2.145-8.622 4.972a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695c.779.25 1.6.422 2.534.525c.363.04 1.935.04 2.299 0c1.611-.178 2.977-.577 4.323-1.264c.207-.106.247-.134.219-.158c-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592l-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51c-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106l.006-4.703l.007-4.705l.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051c.478 0 .558.018.682.154a466.83 466.83 0 0 1 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879l.096-.063a12.317 12.317 0 0 0 2.466-2.163a11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748c0-.893-.012-1.088-.108-1.747c-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218l-.744-1.14l-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z"
              />
            </svg>
            <p className="text-gray-700 font-medium md:text-base text-sm">
              Next.js
            </p>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-9 w-8 text-gray-500"
              viewBox="0 0 32 32"
            >
              <path
                fill="currentColor"
                d="M16 13.146c-1.573 0-2.854 1.281-2.854 2.854s1.281 2.854 2.854 2.854c1.573 0 2.854-1.281 2.854-2.854S17.573 13.146 16 13.146zm-7.99 8.526l-.63-.156C2.692 20.328 0 18.318 0 15.995s2.693-4.333 7.38-5.521l.63-.156l.177.625a31.42 31.42 0 0 0 1.818 4.771l.135.281l-.135.286a31.047 31.047 0 0 0-1.818 4.771zm-.921-9.74c-3.563 1-5.75 2.536-5.75 4.063s2.188 3.057 5.75 4.063a33.28 33.28 0 0 1 1.578-4.063a32.958 32.958 0 0 1-1.578-4.063zm16.901 9.74l-.177-.625a31.163 31.163 0 0 0-1.818-4.766l-.135-.286l.135-.286a31.047 31.047 0 0 0 1.818-4.771l.177-.62l.63.156c4.688 1.188 7.38 3.198 7.38 5.521s-2.693 4.333-7.38 5.521zm-.657-5.677a32.524 32.524 0 0 1 1.578 4.063c3.568-1.005 5.75-2.536 5.75-4.063s-2.188-3.057-5.75-4.063a33.663 33.663 0 0 1-1.578 4.063zM7.078 11.927l-.177-.625C5.583 6.656 5.984 3.323 8 2.161c1.979-1.141 5.151.208 8.479 3.625l.453.464l-.453.464a31.458 31.458 0 0 0-3.229 3.958l-.182.255l-.313.026a31.612 31.612 0 0 0-5.047.813zm2.531-8.838c-.359 0-.677.073-.943.229c-1.323.766-1.557 3.422-.646 7.005a33.343 33.343 0 0 1 4.313-.672a32.828 32.828 0 0 1 2.734-3.391c-2.078-2.026-4.047-3.172-5.458-3.172zm12.787 27.145c-.005 0-.005 0 0 0c-1.901 0-4.344-1.427-6.875-4.031l-.453-.464l.453-.464a31.458 31.458 0 0 0 3.229-3.958l.177-.255l.313-.031a30.668 30.668 0 0 0 5.052-.813l.63-.156l.177.625c1.318 4.646.917 7.974-1.099 9.135a3.095 3.095 0 0 1-1.604.411zm-5.464-4.505c2.078 2.026 4.047 3.172 5.458 3.172h.005c.354 0 .672-.078.938-.229c1.323-.766 1.563-3.422.646-7.005a32.644 32.644 0 0 1-4.313.667a32.886 32.886 0 0 1-2.734 3.396zm7.99-13.802l-.63-.161a31.993 31.993 0 0 0-5.052-.813l-.313-.026l-.177-.255a31.458 31.458 0 0 0-3.229-3.958l-.453-.464l.453-.464c3.328-3.417 6.5-4.766 8.479-3.625c2.016 1.161 2.417 4.495 1.099 9.141zm-5.255-2.276a33.22 33.22 0 0 1 4.313.672c.917-3.583.677-6.24-.646-7.005c-1.318-.76-3.797.406-6.401 2.943a34.067 34.067 0 0 1 2.734 3.391zM9.609 30.234c-.563.01-1.12-.13-1.609-.411c-2.016-1.161-2.417-4.49-1.099-9.135l.177-.625l.63.156c1.542.391 3.24.661 5.047.813l.313.031l.177.255a31.458 31.458 0 0 0 3.229 3.958l.453.464l-.453.464c-2.526 2.604-4.969 4.031-6.865 4.031zm-1.588-8.567c-.917 3.583-.677 6.24.646 7.005c1.318.75 3.792-.406 6.401-2.943a32.886 32.886 0 0 1-2.734-3.396a32.517 32.517 0 0 1-4.313-.667zm7.979.838c-1.099 0-2.224-.047-3.354-.141l-.313-.026l-.182-.26a39.947 39.947 0 0 1-1.797-2.828a39.917 39.917 0 0 1-1.557-2.969l-.135-.286l.135-.286a40.498 40.498 0 0 1 3.354-5.797l.182-.26l.313-.026a39.962 39.962 0 0 1 6.708 0l.313.026l.182.26a40.077 40.077 0 0 1 3.354 5.797l.135.286l-.135.286a39.62 39.62 0 0 1-3.354 5.797l-.182.26l-.313.026a40.483 40.483 0 0 1-3.354.141zm-2.927-1.448c1.969.151 3.885.151 5.859 0a39.03 39.03 0 0 0 2.927-5.063a37.53 37.53 0 0 0-2.932-5.063a37.881 37.881 0 0 0-5.854 0a37.302 37.302 0 0 0-2.932 5.063a38.624 38.624 0 0 0 2.932 5.063z"
              />
            </svg>
            <p className="text-gray-700 font-medium md:text-base text-sm">
              React.js
            </p>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-9 w-8 text-gray-500"
              viewBox="0 0 512 512"
            >
              <path
                fill="currentColor"
                d="M128 204.667C145.062 136.227 187.738 102 256 102c102.4 0 115.2 77 166.4 89.833c34.138 8.56 64-4.273 89.6-38.5C494.938 221.773 452.262 256 384 256c-102.4 0-115.2-77-166.4-89.833c-34.138-8.56-64 4.273-89.6 38.5zm-128 154C17.062 290.227 59.738 256 128 256c102.4 0 115.2 77 166.4 89.833c34.138 8.56 64-4.273 89.6-38.5C366.938 375.773 324.262 410 256 410c-102.4 0-115.2-77-166.4-89.833c-34.138-8.56-64 4.273-89.6 38.5z"
              />
            </svg>
            <p className="text-gray-700 font-medium md:text-base text-sm">
              Tailwind CSS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:w-7 w-6 text-gray-500"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M4 0h16v8h-8zm0 8h8l8 8H4zm0 8h8v8z"
              />
            </svg>
            <p className="text-gray-700 font-medium md:text-base text-sm">
              Framer Motion
            </p>
          </div>
        </div>
      </motion.div>

      <Footer />
    </section>
  );
};

export default Home;
