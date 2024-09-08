import { Pagination } from '@blog/components/organisms/Pagination';
import { Tils } from '@blog/components/organisms/Tils';
import { TIL_LIMIT } from '@blog/libs/const';
import { TilWithRawHtml } from '@blog/types/entry';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { generateTilsBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { useMemo } from 'react';
import titleStyles from '@blog/styles/shared/title.module.css';

interface Props {
  tils: TilWithRawHtml[];
  page: number;
  count: number;
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const { fetchTils, fetchTilsCount } = await import('@blog/libs/dataFetcher');

  const page = 1;
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
        <title> TIL </title>
      </Head>
      <Breadcrumbs list={breadcrumbsList} />
      <Pagination
        baseUrl="/til/page"
        currentPage={page}
        limit={TIL_LIMIT}
        postsCount={count}
      />
      <div className={titleStyles.title}>TIL</div>
      <Tils tils={tils} />
    </>
  );
};

export default Page;
