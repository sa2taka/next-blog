import { Category, Post } from '@/types/entry';

export interface BreadcrumbsItem {
  disabled?: boolean;
  exact?: boolean;
  href?: string;
  link?: boolean;
  text?: string | number;
  to?: string | object;
}

export type BreadcrumbsList = BreadcrumbsItem[];

export const topPageItem: BreadcrumbsItem = {
  disabled: false,
  exact: true,
  link: true,
  text: 'ホーム',
  to: '/',
};

export const generateCategoriesItem = () => {
  return {
    disabled: false,
    exact: true,
    link: true,
    text: 'カテゴリ一覧',
    to: '/category',
  };
};

export const generateCategoriesBreadcrumbsList = () => {
  const item = generateCategoriesItem();
  item.disabled = true;
  return [topPageItem, item];
};

export const generateCategoryBreadcrumbsList = (category: Category) => {
  const list: BreadcrumbsList = [topPageItem, generateCategoriesItem()];
  const categoryItem: BreadcrumbsItem = {
    disabled: true,
    exact: true,
    link: true,
    text: category.fields.name,
    to: `/category/${category.fields.slug}`,
  };
  list.push(categoryItem);

  return list;
};

export const generatePostBreadcrumbsList = (post: Post) => {
  const list: BreadcrumbsList = generateCategoryBreadcrumbsList(
    post.fields.category
  );
  list[list.length - 1].disabled = false;

  const psotItem: BreadcrumbsItem = {
    disabled: true,
    exact: true,
    link: true,
    text: post.fields.title,
    to: `/post/${post.fields.slug}`,
  };
  list.push(psotItem);

  return list;
};
