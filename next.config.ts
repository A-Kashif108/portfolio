import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge would otherwise end up in screenshots from the dev-only render pages.
  devIndicators: false,
};

export default nextConfig;
