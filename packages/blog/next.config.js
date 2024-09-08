const runtimeCaching = require('next-pwa/cache');
const withPWA = require('next-pwa')({
  dest: 'public',
  runtimeCaching: [
    ...runtimeCaching,
    {
      urlPattern:
        '^https://storage.googleapis.com/sa2taka-next-blog.appspot.com/.*.(gif|png|jpg|webp)$',
      handler: 'CacheFirst',
      method: 'GET',
    },
    {
      urlPattern: '^https://fonts.googleapis.com/.*',
      handler: 'CacheFirst',
      method: 'GET',
    },
    {
      urlPattern: '^https://cdnjs.cloudflare.com/.*',
      handler: 'CacheFirst',
      method: 'GET',
    },
    {
      urlPattern: '\\.min\\.(css|js)$',
      handler: 'CacheFirst',
      method: 'GET',
    },
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
};
module.exports = withPWA(nextConfig);
