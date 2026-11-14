import { DEFAULT_OG_IMAGE_ALT, resolveOgImageUrl } from './ogImage';

export interface PageMeta {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
  article?: {
    publishedTime: string;
    modifiedTime: string;
  };
  jsonLd?: object;
  katex?: boolean;
}

type ArticleEntry = {
  title: string;
  ogImage?: string;
  createdAt: number;
  updatedAt: number;
};

export const articlePageMeta = (
  entry: ArticleEntry,
  description: string
): PageMeta => {
  const hasCustomOgImage = Boolean(entry.ogImage);

  return {
    title: entry.title,
    description,
    ogTitle: entry.title,
    ogType: 'article',
    // 記事固有の画像がないときは既定値に任せ、X には正方形の既定画像を出す
    ogImage: hasCustomOgImage ? resolveOgImageUrl(entry.ogImage) : undefined,
    ogImageAlt: hasCustomOgImage
      ? `${entry.title} の OGP 画像`
      : DEFAULT_OG_IMAGE_ALT,
    twitterCard: hasCustomOgImage ? 'summary_large_image' : 'summary',
    article: {
      publishedTime: new Date(entry.createdAt).toISOString(),
      modifiedTime: new Date(entry.updatedAt).toISOString(),
    },
  };
};
