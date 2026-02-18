import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Allow importing content from outside the website directory
  },
};

export default nextConfig;
