import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import {
  CategoryArea,
  CategoryWithCount,
} from '@/components/organisms/CategoryArea';
import { generateCategoriesBreadcrumbsList } from '@/libs/breadcrumbsGenerator';
import { Category } from '@/types/entry';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';

interface Props {
  categories: CategoryWithCount[];
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchCategories, fetchPostsCountInCategory } = await import(
    '@/libs/contentful'
  );
  return {
    props: {
      categories: await fetchCategories().then((categories) =>
        Promise.all(
          categories.items.map(async (category) => {
            return {
              element: category,
              count: await fetchPostsCountInCategory(category.sys.id),
            };
          })
        ).then((categoriesWithCount: CategoryWithCount[]) =>
          categoriesWithCount.filter(
            (categoryWithCount) => categoryWithCount.count > 0
          )
        )
      ),
    },
  };
};

const CategoryHead: React.FC<{ latex: boolean }> = ({ latex }) => {
  return (
    <Head>
      <title>カテゴリ</title>
      <meta name="robots" content="noindex,nofollow" />
    </Head>
  );
};

const CategoryPage: React.FC<Props> = ({ categories }) => {
  const breadcrumbsList = generateCategoriesBreadcrumbsList();

  return (
    <>
      <Breadcrumbs list={breadcrumbsList} />
      <CategoryArea categories={categories} />
    </>
  );
};

export default CategoryPage;
