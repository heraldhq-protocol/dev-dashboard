import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "herald-storage-bucket.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
