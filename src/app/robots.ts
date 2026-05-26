import { MetadataRoute } from 'next';

// Electron 静态导出不支持动态 robots.txt，仅 Web 部署时启用
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/static/'],
    },
  };
}
