import type { BreadcrumbsList } from './breadcrumbsGenerator';
import { AUTHOR, BASE_URL } from './const';
import { DEFAULT_TWITTER_IMAGE, resolveOgImageUrl } from './ogImage';

type ArticleEntry = {
  title: string;
  ogImage?: string;
  createdAt: number;
  updatedAt: number;
};

export const blogPostingJsonLd = (entry: ArticleEntry, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': new URL(path, BASE_URL).toString(),
  },
  headline: entry.title,
  image: [resolveOgImageUrl(entry.ogImage)],
  datePublished: new Date(entry.createdAt).toISOString(),
  dateModified: new Date(entry.updatedAt).toISOString(),
  author: {
    '@type': 'Person',
    name: AUTHOR,
  },
  publisher: {
    '@type': 'Organization',
    name: 'sa2taka',
    logo: {
      '@type': 'ImageObject',
      url: DEFAULT_TWITTER_IMAGE,
    },
  },
});

export const breadcrumbListJsonLd = (list: BreadcrumbsList) => ({
  '@context': 'http://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: list.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@id': item.href,
      '@type': 'ListItem',
      name: item.text,
      item: `${BASE_URL}${item.href}`,
    },
  })),
});
