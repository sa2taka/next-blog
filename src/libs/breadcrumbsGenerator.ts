import { Category, Post } from '@/types/entry';

export interface BreadcrumbsItem {
  disabled: boolean;
  exact: boolean;
  href: string;
  link: boolean;
  text: string;
}

export type BreadcrumbsList = BreadcrumbsItem[];

export const topPageItem: BreadcrumbsItem = {
  disabled: false,
  exact: true,
  link: true,
  text: 'ホーム',
  href: '/',
};

export const generateCategoriesItem = () => {
  return {
    disabled: false,
    exact: true,
    link: true,
    text: 'カテゴリ一覧',
    href: '/category',
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
    href: `/category/${category.fields.slug}`,
  };
  list.push(categoryItem);

  return list;
};

export const generatePostBreadcrumbsList = (post: Post) => {
  const list: BreadcrumbsList = generateCategoryBreadcrumbsList(
    post.fields.category
  );
  list[list.length - 1].disabled = false;

  const postItem: BreadcrumbsItem = {
    disabled: true,
    exact: true,
    link: true,
    text: post.fields.title,
    href: `/post/${post.fields.slug}`,
  };
  list.push(postItem);

  return list;
};
