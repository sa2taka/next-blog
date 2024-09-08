import { Information } from '@blog/components/organisms/PostArea/Information';
import { PostIndex } from '@blog/components/organisms/PostArea/PostIndex';
import React from 'react';
import { Post } from '../../../types/entry';
import { PostIndexItem } from '../../../types/postIndex';
import { MarkdownBody } from '@blog/components/molecules/MarkdownBody';
import styles from './index.module.css';

interface Props {
  post: Post;
  rawHtml: string;
  index: PostIndexItem[];
}

export const PostArea: React.FC<Props> = ({ post, index, rawHtml }) => {
  return (
    <article className={styles.article}>
      <Information post={post} />
      {index.length > 0 && <PostIndex index={index} />}
      <MarkdownBody rawHtml={rawHtml} />
    </article>
  );
};
