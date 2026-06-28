import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the Express backend can serve the frontend as one app.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
