import { motion, useTransform, useScroll } from "framer-motion";
import { FC, useRef } from "react";

interface CarouselProps {
  carouselData: {
    title: string;
    description: string;
    image: string;
  }[];
}

const Carousel1: FC<CarouselProps> = ({ carouselData }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["1%", "-95%"]);
  return <div>Carousel1</div>;
};

export default Carousel1;
