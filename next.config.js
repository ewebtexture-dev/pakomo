import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { cpus: 1, webpackMemoryOptimizations: true },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@assets': path.resolve(process.cwd(), 'assets'),
    };
    return config;
  },
};

export default nextConfig;
