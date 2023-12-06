import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { TilItem } from '@blog/components/organisms/Tils/TilItem';
import { generateTilBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { AUTHOR, BASE_URL } from '@blog/libs/const';
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
  const image = BASE_URL + '/logo.png';

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL + path,
    },
    headline: til.title,
    image: [image],
    datePublished: til.createdAt.toString(),
    dateModified: til.updatedAt.toString(),
    author: {
      '@type': 'Person',
      name: AUTHOR,
    },
    publisher: {
      '@type': 'Organization',
      name: 'sa2taka',
      logo: {
        '@type': 'ImageObject',
        url: BASE_URL + '/logo-for-twitter.png',
      },
    },
  };
};
const TilHead: React.FC<{ til: TilWithRawHtml }> = ({ til }) => {
  const router = useRouter();
  const path = router.pathname;

  const description =
    til.body.length > 200 ? til.body.slice(0, 200) + '...' : til.body;

  return (
    <Head>
      <title>{til.title}</title>
      <meta data-hid="description" name="description" content={description} />
      <meta data-hid="og:title" name="og:title" content={til.title} />
      <meta
        data-hid="og:description"
        name="og:description"
        content={description}
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
