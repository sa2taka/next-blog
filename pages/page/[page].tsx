import { PostPagination } from '@/components/organisms/PostPagination';
import { Posts } from '@/components/organisms/Posts';
import { POSTS_LIMIT } from '@/libs/const';
import { Post } from '@/types/entry';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

interface Props {
  posts: Post[];
  page: number;
  count: number;
}

export const getStaticPaths: GetStaticPaths<{ page: string }> = async () => {
  const { fetchAllPost } = await import('@/libs/dataFetcher');

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
  const { fetchPosts, fetchPostsCount } = await import('@/libs/dataFetcher');
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
      posts,
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
      <PostPagination
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
