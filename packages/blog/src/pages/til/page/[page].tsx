import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { Pagination } from '@blog/components/organisms/Pagination';
import { Tils } from '@blog/components/organisms/Tils';
import { generateTilsBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { TIL_LIMIT } from '@blog/libs/const';
import { Til, TilWithRawHtml } from '@blog/types/entry';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';

interface Props {
  tils: TilWithRawHtml[];
  page: number;
  count: number;
}

export const getStaticPaths: GetStaticPaths<{ page: string }> = async () => {
  const { fetchAllTil } = await import('@blog/libs/dataFetcher');

  const tils = await fetchAllTil();
  const allPage = Math.ceil(tils.length / TIL_LIMIT);

  return {
    paths: Array(allPage)
      .fill(undefined)
      .map((_, page) => ({
        params: {
          page: (page + 1).toString(),
        },
      })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchTils, fetchTilsCount } = await import(
    '@blog/libs/dataFetcher'
  );
  if (!context.params || !context.params.page || context.params.page === '') {
    return {
      notFound: true,
    };
  }
  const page = Number(context.params.page);
  const limit = TIL_LIMIT;

  const { markdown } = await import('@blog/libs/markdown');
  
  const tils = (await fetchTils(page - 1, limit)).map((til) => {
    return { ...til, rawHtml: markdown.render(til.body) };
  });

  const count = await fetchTilsCount();

  return {
    props: {
      page,
      tils,
      count,
    },
  };
};

const Page: NextPage<Props> = ({ count, page, tils }) => {
  const breadcrumbsList = useMemo(() => generateTilsBreadcrumbsList(), []);

  return (
    <>
      <Head>
        <title> TIL {page} ページ目</title>
      </Head>
      <Breadcrumbs list={breadcrumbsList} />
      <Pagination
        baseUrl="/til/page"
        currentPage={page}
        limit={TIL_LIMIT}
        postsCount={count}
      />

      <Tils tils={tils}/>
    </>
  );
};

export default Page;
