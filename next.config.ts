import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  
  // Разрешенные домены для разработки
  allowedDevOrigins: ['https://b25e06e779a1.ngrok-free.app'],
  
  // Оптимизация изображений
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  trailingSlash: true,
  
  // Сжатие
  compress: true,

  // Конфигурация Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Заголовки для производительности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Перенаправления для PWA и API проксирование
  async rewrites() {
    return [
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
      // Проксирование API запросов к бэкенду
      {
        source: '/api/:path*',
        destination: 'http://localhost:4001/:path*',
      },
    ];
  },
};

export default nextConfig;
