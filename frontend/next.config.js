/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
