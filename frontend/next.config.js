/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Enable CSS bundles support
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.module.rules.push({
        test: /\.css$/,
        use: ['isomorphic-style-loader', {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        }],
        sideEffects: true,
      });
    }
    return config;
  },
}

module.exports = nextConfig