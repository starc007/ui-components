"use client";
import React from "react";
import { motion } from "framer-motion";
import gradBg from "@/assets/gradBg.jpg";
import Image from "next/image";

const Hero1 = () => {
  return (
    <section className="md:py-28 py-10 relative">
      <Image
        src={gradBg}
        alt="bg"
        className="absolute top-0 -z-10 opacity-30 left-0 w-full h-full object-contain"
      />
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center mx-auto max-w-5xl"
      >
        <p className="relative">
          <span className="relative z-10 mb-4 inline-block rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-500 md:mb-0">
            beUi is now live 🎉
            <span className="absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-gray-500/0 via-gray-400 to-gray-500/0"></span>
            <span className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-gray-500/0 via-gray-400 to-gray-500/0"></span>
          </span>
        </p>
        <h1 className="sm:text-5xl text-3xl font-semibold text-gray-800 mt-3">
          Building your product{" "}
          <span className="block text-gray-500 mt-2">10x faster with beUi</span>
        </h1>
        <p className="text-gray-400 text-sm mt-4">
          A collection of free, open-source UI components for your next project.
          <span className="md:block">
            Copy and paste the code snippets to use them in your project.
          </span>
        </p>
        <div className="flex flex-wrap justify-center gap-5 mt-8">
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
