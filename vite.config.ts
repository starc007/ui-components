import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const alias = {
  "@": path.resolve(__dirname, "./src"),
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias,
  },
});
