import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().nonempty(),
  slug: z.string().nonempty(),
  sort: z.number().nonnegative(),
});

export type Category = z.infer<typeof categorySchema>;

export type Author = {
  name: string;
  icon: string;
  at: string;
};

export type File = {
  url: string;
  detail: any;
  filename: string;
  contentType: string;
};

export type Image = {
  title: string;
  file: File;
};

export const postSchema = z.object({
  title: z.string().nonempty(),
  slug: z.string().nonempty(),
  description: z.string(),
  body: z.string().nonempty(),
  author: z.string(),
  category: categorySchema,
  tags: z.array(z.string()),
  public: z.boolean(),
  latex: z.boolean(),
  // Next.js のシリアライズの関係で、Date型にせずにgetTimeの値を利用する
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Post = z.infer<typeof postSchema>;
