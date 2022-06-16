/** @type {import('next').NextConfig} */
const withLinaria = require('next-linaria');

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withLinaria({
  ...nextConfig,
});
