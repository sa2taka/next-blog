import { createClient } from '@/plugins/contentful';
import { Category, MultipleItem, Post } from '@/types/entry';

import { CTF_CATEGORY_ID, CTF_POST_ID } from '@/libs/const';
import { SingleItem } from '../types/entry';

const client = createClient();
const isProduction = process.env.NODE_ENV === 'production';

export function fetchCategories() {
  return client.getEntries({
    content_type: CTF_CATEGORY_ID,
    order: 'fields.sort',
  });
}

export function fetchPosts(
  page: number,
  limit: number
): Promise<MultipleItem<Post>> {
  const queries: Record<string, any> = {
    content_type: CTF_POST_ID,
    order: '-sys.createdAt',
    skip: page * limit,
    limit,
  };

  if (isProduction) {
    queries['fields.public'] = true;
  }

  return client.getEntries(queries);
}

export function fetchPostsCount(): Promise<number> {
  const queries: Record<string, any> = {
    content_type: CTF_POST_ID,
    order: '-sys.createdAt',
    limit: 1000,
    select: 'fields.public',
  };

  if (isProduction) {
    queries['fields.public'] = true;
  }

  return client
    .getEntries(queries)
    .then((posts: MultipleItem<Post>) => posts.total);
}

export async function fetchPostsCountInCategory(
  categoryId: string
): Promise<number> {
  const queries: Record<string, any> = {
    content_type: CTF_POST_ID,
    limit: 1000,
    order: '-sys.createdAt',
    'fields.category.sys.id': categoryId,
    select: 'fields.public',
  };

  if (isProduction) {
    queries['fields.public'] = true;
  }

  const count = await client
    .getEntries(queries)
    .then((posts: MultipleItem<Post>) => posts.items.length);
  return count;
}

export function fetchPostInCategory(
  categorySlug: string,
  page: number,
  limit: number
): Promise<MultipleItem<Category>> {
  const queries: Record<string, any> = {
    content_type: CTF_POST_ID,
    limit,
    skip: page * limit,
    order: '-sys.createdAt',
    'fields.category.sys.contentType.sys.id': CTF_CATEGORY_ID,
    'fields.category.fields.slug': categorySlug,
  };

  if (isProduction) {
    queries['fields.public'] = true;
  }

  return client.getEntries(queries);
}

export function fetchPost(slug: string): SingleItem<Post> {
  return client
    .getEntries({
      content_type: CTF_POST_ID,
      'fields.slug': slug,
    })
    .then((posts: MultipleItem<Post>) => posts.items[0]);
}
