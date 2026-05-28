import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Electron 环境下使用 assetPrefix 指向自定义协议
  assetPrefix: 'app://./',
};

export default nextConfig;
