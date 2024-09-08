import React from 'react';
import { Post } from '@blog/types/entry';
import { useMemo } from 'react';
import { AnimationLink } from '../../atoms/AnimationLink/index';
import Link from 'next/link';
import { formatDate, formatDateForMachine } from '../../../libs/formatDate';
import styles from './PostItem.module.css';
import textStyles from '@blog/styles/shared/text.module.css';
interface Props {
  post: Omit<Post, 'body'>;
}

export const PostItem: React.FC<Props> = ({ post }) => {
  const categoryHref = useMemo(() => `/category/${post.category.slug}`, [post]);
  const postHref = useMemo(() => `/post/${post.slug}`, [post]);

  const formattedDate = useMemo(() => {
    const target = new Date(post.createdAt);
    return formatDate(target);
  }, [post.createdAt]);
  const formattedDateForDateTag = useMemo(() => {
    const target = new Date(post.createdAt);
    return formatDateForMachine(target);
  }, [post]);

  return (
    <li className={styles.postLi}>
      <span>
        <AnimationLink
          href={categoryHref}
          className={`${styles.postCategory} ${textStyles.secondaryText}`}
        >
          {post.category.name}
        </AnimationLink>
      </span>
      <Link href={postHref} className={styles.titleLink}>
        {post.title}
      </Link>

      <time className={styles.postCreatedAt} dateTime={formattedDateForDateTag}>
        {formattedDate}
      </time>
    </li>
  );
};
