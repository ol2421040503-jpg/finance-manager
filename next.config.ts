import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  // Electron 打包时通过环境变量 ELECTRON_BUILD 启用静态导出
  ...(process.env.ELECTRON_BUILD ? { output: 'export' as const } : {}),
  images: {
    unoptimized: process.env.ELECTRON_BUILD ? true : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
