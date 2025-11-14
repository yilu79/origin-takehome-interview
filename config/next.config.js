/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for performance
  experimental: {
    // Optimize runtime performance
    optimizePackageImports: ['date-fns'],
  },

  // Turbopack configuration for Next.js 16
  turbopack: {
    // Empty config to enable Turbopack without warnings
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security and performance
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Output optimization for Vercel deployment only
  // Vercel automatically handles standalone builds, so we don't need to set it
  // Removing this allows 'npm start' to work locally for testing production builds
};

module.exports = nextConfig;
