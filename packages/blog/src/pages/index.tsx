import { PostPagination } from '@blog/components/organisms/PostPagination';
import { Posts } from '@blog/components/organisms/Posts';
import { POSTS_LIMIT } from '@blog/libs/const';

import type { NextPage } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import { Post } from '@blog/types/entry';
import { omitBodyFromPost } from '@blog/libs/omitBodyFromPost';

type Props = {
  posts: Omit<Post, 'body'>[];
  page: number;
  count: number;
};

export const getStaticProps = async (
  _context: AppContext
): Promise<{
  props: Props;
}> => {
  const { fetchPosts, fetchPostsCount } = await import(
    '@blog/libs/dataFetcher'
  );
  const page = 1;
  const limit = POSTS_LIMIT;

  const posts = await fetchPosts(page - 1, limit);

  const count = await fetchPostsCount();

  return {
    props: {
      page,
      posts: posts.map(omitBodyFromPost),
      count,
    },
  };
};

const Home: NextPage<Props> = ({ count, page, posts }) => {
  return (
    <>
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

export default Home;
