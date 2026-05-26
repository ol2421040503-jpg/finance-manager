import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
};

export const metadata: Metadata = {
  title: {
    default: '销售专属理财管理器',
    template: '%s | 销售专属理财管理器',
  },
  description: '专为销售人员设计的理财管理工具，智能分配提成收入，实现财务稳健增长',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '理财管理器',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
