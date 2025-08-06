import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const config: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@fortawesome/react-fontawesome", "lucide-react"],
  },
  // Enable faster refresh
  reactStrictMode: false,
};

export default config;
