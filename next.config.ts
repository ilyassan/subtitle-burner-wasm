import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  basePath: process.env.NODE_ENV === 'production' ? '/subtitle-burner-wasm' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/subtitle-burner-wasm/' : '',
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    return config;
  },
  experimental: {
    reactCompiler: true,
  }
};
module.exports = nextConfig;