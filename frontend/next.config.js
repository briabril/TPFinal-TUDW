/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api.bloop.cool/:path*", 
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

module.exports = nextConfig;
