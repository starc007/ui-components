import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#508EF7",
      },
      animation: {
        testimonial: "testimonial 20s linear infinite",
      },
      keyframes: {
        testimonial: {
          from: { transform: "translateX(0%)" },
          to: { transform: "translateX(calc(-100% - 4rem))" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
