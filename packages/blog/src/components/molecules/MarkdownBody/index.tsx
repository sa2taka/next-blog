import React from 'react';
import styles from './index.module.css';
import prismThemeStyle from './prismTheme.module.css';
import './prismTheme.module.css';

interface Props {
  rawHtml: string;
}

export const MarkdownBody: React.FC<Props> = ({ rawHtml }) => {
  return (
    <div
      className={`prismTheme ${prismThemeStyle.prismTheme} ${styles.postBody}`}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
};
