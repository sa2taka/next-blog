import { postBodyStyle } from '@/components/organisms/PostArea/postStyle';
import { prismTheme } from '@/components/organisms/PostArea/prismTheme';
import React from 'react';

import './prism.ts';

interface Props {
  rawHtml: string;
}

export const PostBody: React.FC<Props> = ({ rawHtml }) => {
  return (
    <div
      className={`${prismTheme} ${postBodyStyle} post-body`}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
};
