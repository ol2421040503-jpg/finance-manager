import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 不设置 assetPrefix，使用默认的 /_next/ 路径
  // Electron 中通过 protocol.handle 将 app:// 映射到本地 out/ 目录
};

export default nextConfig;
