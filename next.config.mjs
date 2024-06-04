/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "build",
  cleanDistDir: true,
  // Optional: Add a trailing slash to all paths `/about` -> `/about/`
  trailingSlash: true,
};

export default nextConfig;
