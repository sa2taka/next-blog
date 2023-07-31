import { Category, Post, Til, TilWithRawHtml } from '@blog/types/entry';

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

export const generateTilItem = () => {
  return {
    disabled: false,
    exact: true,
    link: true,
    text: 'TIL',
    href: '/til',
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
    text: category.name,
    href: `/category/${category.slug}/1`,
  };
  list.push(categoryItem);

  return list;
};

export const generatePostBreadcrumbsList = (post: Post) => {
  const list: BreadcrumbsList = generateCategoryBreadcrumbsList(post.category);
  list[list.length - 1].disabled = false;

  const postItem: BreadcrumbsItem = {
    disabled: true,
    exact: true,
    link: true,
    text: post.title,
    href: `/post/${post.slug}`,
  };
  list.push(postItem);

  return list;
};

export const generateTilsBreadcrumbsList = () => {
  const item = generateTilItem();
  item.disabled = true;
  return [topPageItem, item];
};

export const generateTilBreadcrumbsList = (til: Til | TilWithRawHtml) => {
  const list: BreadcrumbsList = [topPageItem, generateTilItem()];
  const categoryItem: BreadcrumbsItem = {
    disabled: true,
    exact: true,
    link: true,
    text: til.title,
    href: `/til/${til.slug}`,
  };
  list.push(categoryItem);

  return list;
};
