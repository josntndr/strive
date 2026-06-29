import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Static export so the Express backend can serve the frontend as one app.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
};

export default nextConfig;
