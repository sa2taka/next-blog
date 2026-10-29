import { copyFile } from 'node:fs/promises';
import sitemap from '@astrojs/sitemap';
import type { AstroIntegration } from 'astro';
import { defineConfig } from 'astro/config';
import { BASE_URL } from './src/libs/const';

const isListingPage = (page: string) =>
  /^\/(page|category)(\/|$)/.test(new URL(page).pathname);

/**
 * robots.txt とフィードテストが参照する /sitemap.xml を、
 * @astrojs/sitemap が出力する sitemap-index.xml の複製として用意する。
 */
const sitemapIndexAlias = (): AstroIntegration => ({
  name: 'sitemap-index-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      await copyFile(
        new URL('sitemap-index.xml', dir),
        new URL('sitemap.xml', dir)
      );
    },
  },
});

export default defineConfig({
  site: BASE_URL,
  outDir: './out',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      changefreq: 'monthly',
      filter: (page) => !isListingPage(page),
    }),
    sitemapIndexAlias(),
  ],
});
