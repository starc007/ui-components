"use client";
import React from "react";
import { motion } from "framer-motion";

const Hero1 = () => {
  return (
    <section className="relative">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mx-auto max-w-5xl"
      >
        <h1 className="sm:text-5xl text-3xl font-semibold text-gray-800">
          Building your product{" "}
          <span className="block text-gray-500 mt-2">10x faster with beUi</span>
        </h1>
        <p className="text-gray-400 text-sm mt-4">
          A collection of free, open-source UI components for your next project.
          <span className="md:block">
            Copy and paste the code snippets to use them in your project.
          </span>
        </p>
        <div className="flex justify-center gap-5 mt-8">
          <button className="bg-gray-800 text-white px-6 py-2 rounded-xl hover:ring-1 ring-gray-800 hover:ring-offset-1 duration-300">
            Get Started
          </button>
          <button className="border border-gray-200 text-gray-800 px-6 py-2 rounded-xl hover:bg-gray-200 duration-300 hover:ring-1 ring-gray-300 hover:ring-offset-1">
            Learn More
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero1;
