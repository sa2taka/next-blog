import { Information } from '@blog/components/organisms/PostArea/Information';
import { PostIndex } from '@blog/components/organisms/PostArea/PostIndex';
import { styled } from '@linaria/react';
import React from 'react';
import { Post } from '../../../types/entry';
import { PostIndexItem } from '../../../types/postIndex';
import { MarkdownBody } from '@blog/components/molecules/MarkdownBody';

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
      {index.length > 0 && <PostIndex index={index} />}
      <MarkdownBody rawHtml={rawHtml} />
    </Article>
  );
};
