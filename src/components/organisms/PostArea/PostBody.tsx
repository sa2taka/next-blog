import { postBodyStyle } from '@/components/organisms/PostArea/postStyle';
import React from 'react';

interface Props {
  rawHtml: string;
}

export const PostBody: React.FC<Props> = ({ rawHtml }) => {
  return (
    <div
      className={postBodyStyle}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
};
