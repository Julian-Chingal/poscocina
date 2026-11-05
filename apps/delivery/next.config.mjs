import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@poscocina/shared'],
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
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
