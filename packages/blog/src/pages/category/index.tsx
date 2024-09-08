import { Breadcrumbs } from '@blog/components/molecules/Breadcrumbs';
import {
  CategoryArea,
  CategoryWithCount,
} from '@blog/components/organisms/CategoryArea';
import { generateCategoriesBreadcrumbsList } from '@blog/libs/breadcrumbsGenerator';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import React from 'react';
import titleStyles from '@blog/styles/shared/title.module.css';

interface Props {
  categories: CategoryWithCount[];
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const { fetchCategories, fetchPostsCountInCategory } = await import(
    '@blog/libs/dataFetcher'
  );
  return {
    props: {
      categories: await fetchCategories().then((categories) =>
        Promise.all(
          categories.map(async (category) => {
            return {
              element: category,
              count: await fetchPostsCountInCategory(category.slug),
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

const CategoryHead: React.FC = () => {
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
      <CategoryHead />
      <Breadcrumbs list={breadcrumbsList} />
      <h2 className={titleStyles.title}>カテゴリ</h2>
      <CategoryArea categories={categories} />
    </>
  );
};

export default CategoryPage;
