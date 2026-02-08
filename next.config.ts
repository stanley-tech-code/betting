import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/aviator',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig;
