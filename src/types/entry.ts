type ChildSys = {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
};

export type Sys = {
  space: ChildSys;
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  environment: ChildSys;
  revision: number;
  contentType: ChildSys;
  locale: string;
};

export interface SingleItem<Field> {
  sys: Sys;
  fields: Field;
}

export type Category = SingleItem<{
  name: string;
  slug: string;
  sort: number;
}>;

export type Author = SingleItem<{
  name: string;
  icon: string;
  at: string;
}>;

export type File = {
  url: string;
  detail: any;
  filename: string;
  contentType: string;
};

export type Image = SingleItem<{
  title: string;
  file: File;
}>;

export type Post = SingleItem<{
  title: string;
  description: string;
  body: string;
  author: Author;
  category: Category;
  slug: string;
  tags: string[];
  postImage: Image;
  public: boolean;
  releaseDate: string;
  latex: boolean;
}>;

export type FileDetail = {
  size: number;
  image?: {
    width: number;
    height: number;
  };
};

export interface MultipleItem<Field> {
  sys: {
    type: string;
  };
  total: number;
  skip: number;
  limit: number;
  items: SingleItem<Field>[];
}
