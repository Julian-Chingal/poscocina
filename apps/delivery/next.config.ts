import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@poscocina/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_API_URL || 'http://localhost:3000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: process.env.BACKEND_UPLOADS_URL || 'http://localhost:3000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
