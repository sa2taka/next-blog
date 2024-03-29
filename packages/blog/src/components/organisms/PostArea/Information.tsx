import React from 'react';
import { styled } from '@linaria/react';
import { Post } from '../../../types/entry';
import { useMemo } from 'react';
import Link from 'next/link';
import { secondaryText } from '../../styles/text';
import { AnimationLink } from '../../atoms/AnimationLink/index';
import {
  formatDateWithDay,
  formatDateForMachine,
} from '../../../libs/formatDate';
import { css } from '@linaria/core';

interface Props {
  post: Post;
}

const InformationRoot = styled.div`
  padding: 8px 12px;
  margin-bottom: 0;
  margin-top: auto;
  min-width: 80%;
  overflow-wrap: break-word;

  display: flex;
  align-items: center;
  flex-flow: column;
`;

const categoryLinkStyle = css`
  margin-bottom: 0px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
`;

const PostTitle = styled.h1`
  font-size: 2em;
  text-align: center;
  margin: 0.4em auto;
  line-height: 1.4em;
  overflow-wrap: anywhere;

  @media screen and (max-width: 768px) {
    & {
      font-size: 1.4em;
    }
  }
`;

const PostDate = styled.p`
  font-size: 0.9em;
  margin-bottom: 0;
  margin-top: 0;

  .theme--dark {
    color: #ccc;
  }

  .theme--light {
    color: #222;
  }
`;

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
    <InformationRoot>
      <span>
        <AnimationLink
          href={postLink}
          className={`${secondaryText} ${categoryLinkStyle}`}
        >
          {post.category.name}
        </AnimationLink>
      </span>

      <PostTitle>{post.title}</PostTitle>
      <PostDate>
        作成日: <time dateTime={createdAtForDateTag}>{createdAt}</time>
      </PostDate>
      <PostDate>
        更新日: <time dateTime={updatedAtForDateTag}>{updatedAt}</time>
      </PostDate>
    </InformationRoot>
  );
};
