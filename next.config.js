/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure the app knows it is being served under a sub-path
  basePath: '/mermaid-designer',
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
