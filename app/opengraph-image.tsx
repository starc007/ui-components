import { ImageResponse } from "next/og";
import { OG_SIZE, ogImage } from "@/lib/og";

export const runtime = "edge";
export const alt = "beUI · The motion toolkit for React & Next.js";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(ogImage(), OG_SIZE);
}
