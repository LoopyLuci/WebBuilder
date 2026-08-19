/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@webbuilder/core', '@webbuilder/components', '@webbuilder/mcp-server', '@webbuilder/android'],
};

module.exports = nextConfig;
