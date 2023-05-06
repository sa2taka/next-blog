import { Category, categorySchema, Post, postSchema } from '@blog/types/entry';

import * as path from 'path';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

const DATA_ROOT = path.join(__dirname, '..', '..', '..', '..', '..', '_data');

const isProduction = process.env.NODE_ENV === 'production';

const extractHeaderRegexp = /-{3,}\n([\s\S]*?)\n-{3,}/;

const categoryMemorized: Record<string, Category | undefined> = {};
const postMemorized: Record<string, Post | undefined> = {};

class ParseError extends Error {
  static {
    this.prototype.name = 'ParseError';
  }
}

const extractHeader = (data: string): string | undefined => {
  return extractHeaderRegexp.exec(data)?.[1];
};

const extractBody = (data: string): string | undefined => {
  return data.replace(extractHeaderRegexp, '');
};

const getSlug = (filePath: string): string => {
  return path.basename(filePath, '.md');
};

const parseHeader = async (
  data: string,
  convert: (key: string, value: string) => Promise<any>
): Promise<object> => {
  const header = extractHeader(data);
  if (!header) {
    throw new ParseError();
  }
  const lines = header.split('\n');

  const result: any = {};

  let key = '';
  let value = '';
  for (const line of lines) {
    const index = line.indexOf(':');
    if (index > 0) {
      if (key) {
        result[key] = await convert(key, value);
      }
      key = line.slice(0, index).trim();
      value = line.slice(index + 1).trim();
    } else if (line.startsWith('  ')) {
      value += line.trim();
    }
  }

  if (key) {
    result[key] = await convert(key, value);
  }

  return result;
};

const convertCategoryKeyValue = async (key: string, value: string) => {
  if (key === 'sort') {
    return Number(value);
  }

  return value;
};
const parseCategory = async (slug: string, data: string): Promise<Category> => {
  const header = await parseHeader(data, convertCategoryKeyValue);
  return categorySchema.parse({ slug, ...header });
};

const convertPostKeyValue = async (key: string, value: string) => {
  if (key === 'createdAt' || key === 'updatedAt') {
    return new Date(value).getTime();
  }

  if (key === 'public' || key === 'latex') {
    return value === 'true';
  }

  if (key === 'category') {
    return fetchCategory(value);
  }

  if (key === 'tags') {
    return value.split(',').filter((s) => s);
  }

  return value;
};
const parsePost = async (slug: string, data: string): Promise<Post> => {
  const header = await parseHeader(data, convertPostKeyValue);
  return postSchema.parse({ slug, ...header, body: extractBody(data) });
};

export async function fetchCategory(slug: string): Promise<Category> {
  const memorized = categoryMemorized[slug];
  if (memorized) {
    return memorized;
  }
  const categoryFilePath = path.join(DATA_ROOT, '_categories', `${slug}.md`);

  const file = await readFile(categoryFilePath);

  return parseCategory(slug, file?.toString())
    .then((c) => {
      isProduction && (categoryMemorized[slug] = c);
      return c;
    })
    .catch((e) => {
      throw new ParseError(
        `[Parse Error]: category "${categoryFilePath}" cannot parse.`,
        { cause: e }
      );
    });
}

export async function fetchCategories(): Promise<Category[]> {
  const categoryFilePaths = await glob(
    path.join(DATA_ROOT, '_categories', '*.md')
  );

  return (
    await Promise.all(categoryFilePaths.map(getSlug).map(fetchCategory))
  ).sort((a, b) => a.sort - b.sort);
}

export async function fetchPost(slug: string): Promise<Post> {
  const postFilePath = path.join(DATA_ROOT, '_posts', `${slug}.md`);

  const file = await readFile(postFilePath);

  if (!file || !file?.toString()) {
    throw new ParseError(`[Parse Error]: post "${postFilePath}" cannot parse.`);
  }

  return parsePost(getSlug(postFilePath), file?.toString()).catch((e) => {
    throw new ParseError(
      `[Parse Error]: post "${postFilePath}" cannot parse.`,
      { cause: e }
    );
  });
}

export async function fetchAllPost(): Promise<Post[]> {
  const categoryFilePaths = await glob(path.join(DATA_ROOT, '_posts', '*.md'));

  return (await Promise.all(categoryFilePaths.map(getSlug).map(fetchPost)))
    .filter((p) => !isProduction || p.public)
    .sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
}

export async function fetchPosts(page: number, limit: number): Promise<Post[]> {
  const posts = await fetchAllPost();
  return posts
    .sort((a, b) => {
      return b.createdAt - a.createdAt;
    })
    .slice(page * limit, (page + 1) * limit);
}

export async function fetchPostsCount(): Promise<number> {
  return (await fetchAllPost()).length;
}

export async function fetchPostInCategory(
  categorySlug: string,
  page: number,
  limit: number
): Promise<Post[]> {
  const posts = await fetchAllPost();

  const categoryPosts = posts.filter((p) => p.category.slug === categorySlug);

  return categoryPosts
    .sort((a, b) => {
      return b.createdAt - a.createdAt;
    })
    .slice(page * limit, (page + 1) * limit);
}

export async function fetchPostsCountInCategory(
  categorySlug: string
): Promise<number> {
  const posts = await fetchAllPost();

  return posts.filter((p) => p.category.slug === categorySlug).length;
}
