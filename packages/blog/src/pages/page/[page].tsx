import { Pagination } from '@blog/components/organisms/Pagination';
import { Posts } from '@blog/components/organisms/Posts';
import { POSTS_LIMIT } from '@blog/libs/const';
import { omitBodyFromPost } from '@blog/libs/omitBodyFromPost';
import { Post } from '@blog/types/entry';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

interface Props {
  posts: Omit<Post, 'body'>[];
  page: number;
  count: number;
}

export const getStaticPaths: GetStaticPaths<{ page: string }> = async () => {
  const { fetchAllPost } = await import('@blog/libs/dataFetcher');

  const posts = await fetchAllPost();
  const allPage = Math.ceil(posts.length / POSTS_LIMIT);

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
  const { fetchPosts, fetchPostsCount } = await import(
    '@blog/libs/dataFetcher'
  );
  if (!context.params || !context.params.page || context.params.page === '') {
    return {
      notFound: true,
    };
  }
  const page = Number(context.params.page);
  const limit = POSTS_LIMIT;

  const posts = await fetchPosts(page - 1, limit).then((posts) => {
    return posts.map((item) => {
      item.body = '';
      return item;
    });
  });

  const count = await fetchPostsCount();

  return {
    props: {
      page,
      posts: posts.map(omitBodyFromPost),
      count,
    },
  };
};

const Page: NextPage<Props> = ({ count, page, posts }) => {
  return (
    <>
      <Head>
        <title> {page} ページ目</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Pagination
        baseUrl="/page"
        currentPage={page}
        limit={POSTS_LIMIT}
        postsCount={count}
      />
      <Posts posts={posts} />
    </>
  );
};

export default Page;
