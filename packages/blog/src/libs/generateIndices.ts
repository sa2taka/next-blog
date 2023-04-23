import { PostIndexItem } from '@blog/types/postIndex';

export const generateIndices = (markdown: string) => {
  const markdownWithoutCode = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[\s\S]+?`/g, '');
  const regexp = /^\s*(?<hash>#{1,3})\s*(?<title>.+)\s*$/gm;

  const postIndex: PostIndexItem[] = [];

  let match: RegExpMatchArray | null;
  while ((match = regexp.exec(markdownWithoutCode))) {
    if (match?.groups) {
      const level = match.groups.hash.length;
      const title = match.groups.title;

      postIndex.push({
        level,
        title,
      });
    }
  }
  return postIndex;
};
