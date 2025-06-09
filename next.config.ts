import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
    dynamicIO: true,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
  // Static optimization
  output: "standalone",
};

export default nextConfig;
