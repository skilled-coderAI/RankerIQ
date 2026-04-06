import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["rankeriq.com", "*.rankeriq.com"],
};

export default nextConfig;
