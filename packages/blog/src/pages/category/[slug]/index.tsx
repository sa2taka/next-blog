import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import { PostPagination } from '@blog/components/organisms/PostPagination';
import { Posts } from '@blog/components/organisms/Posts';
import { generateCategoryBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { POSTS_LIMIT } from '@blog/libs/const';
import { omitBodyFromPost } from '@blog/libs/omitBodyFromPost';
import { Category, Post } from '@blog/types/entry';
import { styled } from '@linaria/react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

interface Props {
  posts: Omit<Post, 'body'>[];
  count: number;
  category: Category;
  slug: string;
}

type Params = {
  page: string;
  slug: string;
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const { fetchCategories, fetchPostsCountInCategory } = await import(
    '@blog/libs/dataFetcher'
  );

  const categories = await fetchCategories().then((categories) =>
    Promise.all(
      categories.map(async (category) => {
        return {
          element: category,
          count: await fetchPostsCountInCategory(category.slug),
        };
      })
    ).then((categoriesWithCount) =>
      categoriesWithCount.filter(
        (categoryWithCount) => categoryWithCount.count > 0
      )
    )
  );
  categories;
  return {
    paths: categories.flatMap(({ element: category, count }) => {
      const allPage = Math.ceil(count / POSTS_LIMIT);

      return Array(allPage)
        .fill(undefined)
        .map((_, page) => ({
          params: {
            slug: category.slug,
            page: (page + 1).toString(),
          },
        }));
    }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props, Params> = async (
  context
) => {
  const { fetchPostInCategory, fetchCategory } = await import(
    '@blog/libs/dataFetcher'
  );

  if (!context.params) {
    return {
      notFound: true,
    };
  }
  const categorySlug = context.params.slug;
  const limit = POSTS_LIMIT;
  const posts = await fetchPostInCategory(categorySlug, 0, limit);
  const category = await fetchCategory(categorySlug);

  const count = posts.length;

  return {
    props: {
      posts: posts.map(omitBodyFromPost),
      slug: categorySlug,
      category,
      count,
    },
  };
};

const Title = styled.h2`
  text-align: center;
`;

const Page: NextPage<Props> = ({ count, posts, slug, category }) => {
  const breadcrumbsList = generateCategoryBreadcrumbsList(category);
  return (
    <>
      <Head>
        <title>{category.name} カテゴリ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Breadcrumbs list={breadcrumbsList} />
      <PostPagination
        baseUrl={`/category/${slug}`}
        currentPage={1}
        limit={POSTS_LIMIT}
        postsCount={count}
      />
      <Title>{category.name}</Title>
      <Posts posts={posts} />
    </>
  );
};

export default Page;
