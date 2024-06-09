"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { FC, useEffect, useRef, useState } from "react";

interface FlipTextAnimationProps {
  words: string[];
}

// words = ["Pretty", "Faster", "Better"]

const FlipTextAnimation: FC<FlipTextAnimationProps> = ({ words }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % words.length);
    }, 3000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span className="relative text-primary font-bold">
      <span className="invisible">words[0]</span>
      <span className="absolute left-0 w-full h-full text-left">
        <AnimatePresence>
          {words.map(
            (word, index) =>
              currentStep === index && (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute left-0 w-full"
                  style={{ transformOrigin: "0% 0%" }}
                >
                  {word}
                </motion.span>
              )
          )}
        </AnimatePresence>
      </span>
    </span>
  );
};

export default FlipTextAnimation;
