import { postBodyStyle } from './postStyle';
import { prismTheme } from './prismTheme';
import React from 'react';

import '@blog/libs/prism';

interface Props {
  rawHtml: string;
}

export const MarkdownBody: React.FC<Props> = ({ rawHtml }) => {
  return (
    <div
      className={`${prismTheme} ${postBodyStyle} post-body`}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
};
