import React from 'react';
import { styled } from '@linaria/react';
import { Post } from '@/types/entry';
import { useMemo } from 'react';
import { css } from '@linaria/core';
import { AnimationLink } from '../../atoms/AnimationLink/index';
import { secondaryText } from '../../styles/text';
import Link from 'next/link';
import { formatDate, formatDateForMachine } from '../../../libs/formatDate';

interface Props {
  post: Post;
}

const PostLi = styled.li`
  list-style: none;
  display: flex;
  flex-flow: column;
`;

const postCategory = css`
  font-size: 0.9em;
  font-weight: 600;
  display: inline-block;
`;

const PostTitle = styled.a`
  font-size: 1.1em;
  font-weight: 600;
  word-break: break-all;
  margin: 8px 0;

  .theme--dark & {
    color: #ddd;
  }

  .theme--light & {
    color: rgba(0, 0, 0, 0.87);
  }

  /* animation */
  position: relative;
  cursor: pointer;

  &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    content: '';
    width: 0;
    height: 1px;
    background-color: #009688;
    transition: 0.3s;
  }

  &:hover::before {
    width: 80px;
  }
`;

const PostCreatedAt = styled.time`
  font-size: 0.9em;

  .theme--dark & {
    color: #aaa;
  }

  .theme--light & {
    color: #444;
  }
`;

export const PostItem: React.FC<Props> = ({ post }) => {
  const categoryHref = useMemo(
    () => `/category/${post.fields.category.fields.slug}`,
    [post]
  );
  const postHref = useMemo(() => `/post/${post.fields.slug}`, [post]);

  const formattedDate = useMemo(() => {
    const target = new Date(post.sys.createdAt);
    return formatDate(target);
  }, [post.sys.createdAt]);
  const formattedDateForDateTag = useMemo(() => {
    const target = new Date(post.sys.createdAt);
    return formatDateForMachine(target);
  }, [post]);

  return (
    <PostLi>
      <span>
        <AnimationLink
          href={categoryHref}
          className={`${postCategory} ${secondaryText}`}
        >
          {post.fields.category.fields.name}
        </AnimationLink>
      </span>
      <Link href={postHref}>
        <PostTitle>{post.fields.title}</PostTitle>
      </Link>

      <PostCreatedAt dateTime={formattedDateForDateTag}>
        {formattedDate}
      </PostCreatedAt>
    </PostLi>
  );
};
