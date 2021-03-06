const withLinaria = require('next-linaria');
const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  pwa: {
    dest: 'public',
    runtimeCaching: [
      ...runtimeCaching,
      {
        urlPattern:
          '^https?://images.ctfassets.net/xw0ljpdch9v4/.*.(gif|png|jpg|webp)$',
        handler: 'CacheFirst',
        method: 'GET',
      },
      {
        urlPattern: '^https?://i.imgur.com/.*.(gif|png|jpg|webp)',
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
  },
};
module.exports = withPWA(
  withLinaria({
    ...nextConfig,
  })
);
