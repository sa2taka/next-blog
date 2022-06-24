import { Information } from '@/components/organisms/PostArea/Information';
import { PostBody } from '@/components/organisms/PostArea/PostBody';
import { PostIndex } from '@/components/organisms/PostArea/PostIndex';
import { styled } from '@linaria/react';
import React from 'react';
import { Post } from '../../../types/entry';
import { PostIndexItem } from '../../../types/postIndex';

interface Props {
  post: Post;
  rawHtml: string;
  index: PostIndexItem[];
}

const Article = styled.article`
  margin-left: auto;
  margin-right: auto;
  margin-top: 12px;

  width: 816px;

  @media (max-width: 1020px) and (min-width: 768px) {
    & {
      width: 80%;
    }
  }

  @media (max-width: 767px) {
    & {
      width: 99%;
    }
  }
`;

export const PostArea: React.FC<Props> = ({ post, index, rawHtml }) => {
  return (
    <Article>
      <Information post={post} />
      <PostIndex index={index} />
      <PostBody rawHtml={rawHtml} />
    </Article>
  );
};
