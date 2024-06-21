import React, { FC, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface CarouselProps {
  testimonialData: {
    id: number;
    title: string;
    name: string;
    content: string;
    image: string;
  }[];
}

const Carousel1: FC<CarouselProps> = ({ testimonialData }) => {
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerWidth = containerRef?.current?.scrollWidth! / 2;

    const animate = () => {
      controls.start({
        x: [0, -containerWidth - 10],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 15,
            ease: "linear",
          },
        },
      });
    };

    animate();
  }, [controls]);

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to left, transparent 0%, black 10%, black 90%, transparent 99%)",
      }}
    >
      <motion.div
        ref={containerRef}
        animate={controls}
        style={{ width: "fit-content" }}
        className="flex justify-center gap-5"
      >
        {testimonialData.concat(testimonialData).map((data) => (
          <motion.div
            key={data.id}
            className="w-80 border border-gray-100 rounded-xl p-4 flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <img
                src={data.image}
                alt={data.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="font-medium">{data.name}</h1>
                <p className="text-sm text-gray-500">{data.title}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{data.content}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Carousel1;
