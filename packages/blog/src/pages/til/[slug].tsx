import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { TilItem } from '@blog/components/organisms/Tils/TilItem';
import { generateTilBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { AUTHOR, BASE_URL, BLOG_TITLE, TWITTER_SITE } from '@blog/libs/const';
import {
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_TWITTER_IMAGE,
  resolveOgImageUrl,
} from '@blog/libs/ogImage';
import { TilWithRawHtml } from '@blog/types/entry';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';

interface Props {
  til: TilWithRawHtml;
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const { fetchAllTil } = await import('@blog/libs/dataFetcher');

  const tils = await fetchAllTil();

  return {
    paths: tils.map((til) => ({
      params: {
        slug: til.slug,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchTil } = await import('@blog/libs/dataFetcher');

  if (!context.params || !context.params.slug || context.params.slug === '') {
    return {
      notFound: true,
    };
  }
  const parsedSlug =
    typeof context.params.slug === 'object'
      ? context.params.slug[0]
      : context.params.slug;
  const til = await fetchTil(parsedSlug);

  if (!til) {
    return {
      notFound: true,
    };
  }

  const { markdown } = await import('@blog/libs/markdown');
  const rawHtml = markdown.render(til.body);
  return {
    props: {
      til: {
        ...til,
        rawHtml,
      },
    },
  };
};

const getSeoStructureData = (til: TilWithRawHtml, path: string) => {
  const image = resolveOgImageUrl(til.ogImage);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': new URL(path, BASE_URL).toString(),
    },
    headline: til.title,
    image: [image],
    datePublished: new Date(til.createdAt).toISOString(),
    dateModified: new Date(til.updatedAt).toISOString(),
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
  };
};

const TilHead: React.FC<{ til: TilWithRawHtml }> = ({ til }) => {
  const router = useRouter();
  const path = router.asPath.split('#')[0]?.split('?')[0] || '/';
  const pageUrl = new URL(path, BASE_URL).toString();
  const ogImageUrl = resolveOgImageUrl(til.ogImage);
  const hasCustomOgImage = Boolean(til.ogImage);
  const socialImageAlt = hasCustomOgImage
    ? `${til.title} の OGP 画像`
    : DEFAULT_OG_IMAGE_ALT;

  const description =
    til.body.length > 200 ? til.body.slice(0, 200) + '...' : til.body;

  return (
    <Head>
      <title>{til.title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="og:title" property="og:title" content={til.title} />
      <meta
        key="og:description"
        property="og:description"
        content={description}
      />
      <meta key="og:type" property="og:type" content="article" />
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:site_name" property="og:site_name" content={BLOG_TITLE} />
      <meta key="og:image" property="og:image" content={ogImageUrl} />
      <meta
        key="og:image:secure_url"
        property="og:image:secure_url"
        content={ogImageUrl}
      />
      <meta
        key="og:image:alt"
        property="og:image:alt"
        content={socialImageAlt}
      />
      <meta
        key="article:published_time"
        property="article:published_time"
        content={new Date(til.createdAt).toISOString()}
      />
      <meta
        key="article:modified_time"
        property="article:modified_time"
        content={new Date(til.updatedAt).toISOString()}
      />
      <meta key="twitter:title" name="twitter:title" content={til.title} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={description}
      />
      <meta
        key="twitter:image"
        name="twitter:image"
        content={ogImageUrl}
      />
      <meta
        key="twitter:image:alt"
        name="twitter:image:alt"
        content={socialImageAlt}
      />
      <meta
        key="twitter:card"
        name="twitter:card"
        content={hasCustomOgImage ? 'summary_large_image' : 'summary'}
      />
      <meta key="twitter:site" name="twitter:site" content={TWITTER_SITE} />
      <meta
        key="twitter:creator"
        name="twitter:creator"
        content={TWITTER_SITE}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getSeoStructureData(til, path)),
        }}
      />
    </Head>
  );
};

const TIlPage: React.FC<Props> = ({ til }) => {
  const breadcrumbsList = useMemo(() => generateTilBreadcrumbsList(til), [til]);
  return (
    <>
      <TilHead til={til} />
      <Breadcrumbs list={breadcrumbsList} />
      <TilItem til={til} />
    </>
  );
};

export default TIlPage;
