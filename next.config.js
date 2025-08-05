/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: ['@opentelemetry/winston-transport'],
  },

  async redirects() {
    return [
      {
        // Redirige de www a dominio raíz
        source: '/(.*)',
        has: [
          {
            type: 'host',
            value: 'www.sommelierai.pro',
          },
        ],
        permanent: true,
        destination: 'https://sommelierai.pro/:path*',
      },
      {
        // Redirige de http a https
        source: '/(.*)',
        has: [
          {
            type: 'protocol',
            value: 'http',
          },
        ],
        permanent: true,
        destination: 'https://sommelierai.pro/:path*',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
