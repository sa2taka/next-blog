import {
  BASE_URL,
  BLOG_DEFAULT_TITLE,
  BLOG_DESCRIPTION,
  BLOG_TITLE,
  OG_LOCALE,
  TWITTER_SITE,
} from '@blog/libs/const';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_TWITTER_IMAGE,
} from '@blog/libs/ogImage';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

interface Props {}

export const SeoHead: React.FC<Props> = ({}) => {
  const router = useRouter();
  const currentPath = router.asPath.split('#')[0]?.split('?')[0] || '/';
  const sitePath = new URL(currentPath, BASE_URL).toString();

  return (
    <Head>
      <meta key="charset" data-hid="charset" charSet="utf-8" />
      <meta
        key="viewport"
        name="viewport"
        content="width=device-width, initial-scale=1"
      />
      <meta
        key="description"
        name="description"
        content={BLOG_DESCRIPTION}
      />
      <meta key="og:title" property="og:title" content={BLOG_DEFAULT_TITLE} />
      <meta
        key="og:description"
        property="og:description"
        content={BLOG_DESCRIPTION}
      />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:image" property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta
        key="og:image:secure_url"
        property="og:image:secure_url"
        content={DEFAULT_OG_IMAGE}
      />
      <meta
        key="og:image:type"
        property="og:image:type"
        content={DEFAULT_OG_IMAGE_TYPE}
      />
      <meta
        key="og:image:width"
        property="og:image:width"
        content={DEFAULT_OG_IMAGE_WIDTH.toString()}
      />
      <meta
        key="og:image:height"
        property="og:image:height"
        content={DEFAULT_OG_IMAGE_HEIGHT.toString()}
      />
      <meta
        key="og:image:alt"
        property="og:image:alt"
        content={DEFAULT_OG_IMAGE_ALT}
      />
      <meta key="og:locale" property="og:locale" content={OG_LOCALE} />
      <meta key="og:site_name" property="og:site_name" content={BLOG_TITLE} />
      <meta key="og:url" property="og:url" content={sitePath} />
      <meta key="twitter:card" name="twitter:card" content="summary" />
      <meta
        key="twitter:title"
        name="twitter:title"
        content={BLOG_DEFAULT_TITLE}
      />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={BLOG_DESCRIPTION}
      />
      <meta
        key="twitter:image"
        name="twitter:image"
        content={DEFAULT_TWITTER_IMAGE}
      />
      <meta
        key="twitter:image:alt"
        name="twitter:image:alt"
        content={DEFAULT_OG_IMAGE_ALT}
      />
      <meta key="twitter:site" name="twitter:site" content={TWITTER_SITE} />
      <link key="canonical" rel="canonical" href={sitePath} />
    </Head>
  );
};
