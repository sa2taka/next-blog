/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: 'https://blog.sa2taka.com',
  generateRobotsTxt: false,
  changefreq: 'monthly',
  outDir: './out',
  exclude: ['/page/*', '/category/*', '/category'],
};

module.exports = config;
