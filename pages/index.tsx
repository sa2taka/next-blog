import { PostPagination } from '@/components/organisms/PostPagination';
import { Posts } from '@/components/organisms/Posts';
import { POSTS_LIMIT } from '@/libs/const';

import type { NextPage } from 'next';
import { AppContext } from 'next/app';
import Head from 'next/head';
import { Post } from '../src/types/entry';

type Props = {
  posts: Post[];
  page: number;
  count: number;
};

export const getStaticProps = async (
  _context: AppContext
): Promise<{
  props: Props;
}> => {
  const { fetchPosts, fetchPostsCount } = await import('@/libs/contentful');
  const page = 1;
  const limit = POSTS_LIMIT;

  const posts = await fetchPosts(page - 1, limit).then((posts) => {
    return posts.items.map((item) => {
      item.fields.body = '';
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
