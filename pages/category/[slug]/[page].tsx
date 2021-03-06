import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { PostPagination } from '@/components/organisms/PostPagination';
import { Posts } from '@/components/organisms/Posts';
import { generateCategoryBreadcrumbsList } from '@/libs/breadcrumbsGenerator';
import { POSTS_LIMIT } from '@/libs/const';
import { Category, Post } from '@/types/entry';
import { styled } from '@linaria/react';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';

interface Props {
  posts: Post[];
  page: number;
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
    '@/libs/contentful'
  );

  const categories = await fetchCategories().then((categories) =>
    Promise.all(
      categories.items.map(async (category) => {
        return {
          element: category,
          count: await fetchPostsCountInCategory(category.sys.id),
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
            slug: category.fields.slug,
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
    '@/libs/contentful'
  );

  if (!context.params) {
    return {
      notFound: true,
    };
  }
  const page = Number(context.params.page);
  const categorySlug = context.params.slug;
  const limit = POSTS_LIMIT;
  const posts = await fetchPostInCategory(categorySlug, page, limit).then(
    (posts) =>
      posts.items.map((item) => {
        item.fields.body = '';
        return item;
      })
  );
  const category = await fetchCategory(categorySlug);

  const count = posts.length;

  return {
    props: {
      page,
      posts,
      slug: categorySlug,
      category,
      count,
    },
  };
};

const Title = styled.h2`
  text-align: center;
`;

const Page: NextPage<Props> = ({ count, page, posts, slug, category }) => {
  const breadcrumbsList = generateCategoryBreadcrumbsList(category);
  return (
    <>
      <Head>
        <title>
          {category.fields.name} ???????????? {page} ????????????
        </title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Breadcrumbs list={breadcrumbsList} />
      <PostPagination
        baseUrl={`/category/${slug}`}
        currentPage={page}
        limit={POSTS_LIMIT}
        postsCount={count}
      />
      <Title>{category.fields.name}</Title>
      <Posts posts={posts} />
    </>
  );
};

export default Page;
