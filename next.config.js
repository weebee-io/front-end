/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['43.202.154.216'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '43.202.154.216',
        port: '8000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
