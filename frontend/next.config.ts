// next.config.js or next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the magic part!
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;