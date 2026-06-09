/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/components/*": [
      "./components/motion/**/*",
      "./components/previews/**/*",
    ],
    "/r/*": [
      "./components/motion/**/*",
      "./components/previews/**/*",
      "./lib/**/*",
    ],
    "/*": [
      "./components/motion/**/*",
      "./lib/**/*",
    ],
  },
};

export default nextConfig;
