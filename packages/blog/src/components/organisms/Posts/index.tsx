import { Post } from '@blog/types/entry';
import React from 'react';
import { styled } from '@linaria/react';
import { PostItem } from '@blog/components/organisms/Posts/PostItem';

interface Props {
  posts: Omit<Post, 'body'>[];
}

export const Posts: React.FC<Props> = ({ posts }) => {
  const PostsUl = styled.ul`
    width: 100%;
    position: relative;
    justify-content: space-between;
    margin-bottom: 48px;

    & > * {
      margin-top: 32px;
    }
  `;

  return (
    <PostsUl>
      {posts.map((post) => (
        <PostItem post={post} key={post.slug} />
      ))}
    </PostsUl>
  );
};
