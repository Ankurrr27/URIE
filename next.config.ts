import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb"
    }
  },
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
