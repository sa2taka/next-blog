import { PostIndexItem } from '@blog/types/postIndex';

export type FormattedPostIndex = {
  title?: string;
  child: FormattedPostIndex[];
  level: number;
};

const append = (index: PostIndexItem, formatted: FormattedPostIndex[]) => {
  switch (index.level) {
    case 1:
      appendElem(formatted, index);
      break;
    case 2:
      appendElem(lastElem(formatted).child, index);
      break;
    case 3:
      appendElem(lastElem(lastElem(formatted).child).child, index);
      break;
  }
};

const appendElem = (parent: FormattedPostIndex[], child: PostIndexItem) => {
  parent.push({
    title: child.title,
    child: [],
    level: child.level,
  });
};

const lastElem = (array: any[]) => {
  return array[array.length - 1];
};

const generateFirstIndex = (first: PostIndexItem): FormattedPostIndex => {
  switch (first.level) {
    case 1:
      return {
        title: first.title,
        child: [],
        level: first.level,
      };
    case 2:
      return {
        child: [
          {
            title: first.title,
            child: [],
            level: first.level,
          },
        ],
        level: 1,
      };
    case 3:
      return {
        child: [
          {
            child: [
              {
                title: first.title,
                child: [],
                level: first.level,
              },
            ],
            level: 2,
          },
        ],
        level: 1,
      };
  }
  return {
    child: [],
    level: 1,
  };
};
export const formatPostIndex = (postIndex: PostIndexItem[]) => {
  const formatted: FormattedPostIndex[] = [];

  // First
  const first = postIndex[0];
  if (!first) {
    return [];
  }
  formatted.push(generateFirstIndex(first));

  postIndex.slice(1).forEach((elem) => {
    append(elem, formatted);
  });

  return formatted;
};
