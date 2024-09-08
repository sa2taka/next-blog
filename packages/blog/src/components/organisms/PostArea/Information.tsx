import React from 'react';
import { Post } from '../../../types/entry';
import { useMemo } from 'react';
import textStyles from '@blog/styles/shared/text.module.css';
import { AnimationLink } from '../../atoms/AnimationLink/index';
import {
  formatDateWithDay,
  formatDateForMachine,
} from '../../../libs/formatDate';
import styles from './Information.module.css';

interface Props {
  post: Post;
}

export const Information: React.FC<Props> = ({ post }) => {
  const postLink = useMemo(() => `/category/${post.category.slug}`, [post]);
  const createdAt = useMemo(
    () => formatDateWithDay(new Date(post.createdAt)),
    [post]
  );
  const updatedAt = useMemo(
    () => formatDateWithDay(new Date(post.updatedAt)),
    [post]
  );
  const createdAtForDateTag = useMemo(
    () => formatDateForMachine(new Date(post.createdAt)),
    [post]
  );
  const updatedAtForDateTag = useMemo(
    () => formatDateForMachine(new Date(post.updatedAt)),
    [post]
  );

  return (
    <div className={styles.informationRoot}>
      <span>
        <AnimationLink
          href={postLink}
          className={`${textStyles.secondaryText} ${styles.categoryLink}`}
        >
          {post.category.name}
        </AnimationLink>
      </span>

      <h1 className={styles.postTitle}>{post.title}</h1>
      <p className={styles.postDate}>
        作成日: <time dateTime={createdAtForDateTag}>{createdAt}</time>
      </p>
      <p className={styles.postDate}>
        更新日: <time dateTime={updatedAtForDateTag}>{updatedAt}</time>
      </p>
    </div>
  );
};
