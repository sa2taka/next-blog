import { Post } from '@blog/types/entry';

export const omitBodyFromPost = (post: Post): Omit<Post, 'body'> => {
  const data: Omit<Post, 'body'> & { body: string | undefined } = {
    ...post,
  };

  delete data.body;

  return data;
};
