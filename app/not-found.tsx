import type { Metadata } from "next";
import { NotFoundGlitch } from "@/components/motion/not-found/glitch";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return <NotFoundGlitch />;
}
