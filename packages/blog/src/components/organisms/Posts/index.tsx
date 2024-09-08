import { Post } from '@blog/types/entry';
import React from 'react';
import styles from './index.module.css';
import { PostItem } from '@blog/components/organisms/Posts/PostItem';

interface Props {
  posts: Omit<Post, 'body'>[];
}

export const Posts: React.FC<Props> = ({ posts }) => {
  return (
    <ul className={styles.postsUl}>
      {posts.map((post) => (
        <PostItem post={post} key={post.slug} />
      ))}
    </ul>
  );
};
