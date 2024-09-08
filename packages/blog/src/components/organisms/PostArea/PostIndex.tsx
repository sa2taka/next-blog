import { formatPostIndex } from '@blog/components/organisms/PostArea/formatPostIndex';
import React, { useMemo } from 'react';
import { PostIndexItem } from '../../../types/postIndex';
import styles from './PostIndex.module.css';

interface Props {
  index: PostIndexItem[];
}

export const PostIndex: React.FC<Props> = ({ index }) => {
  const formattedPostIndex = useMemo(() => formatPostIndex(index), [index]);
  return (
    <nav className={styles.postIndexNav}>
      <span className={styles.postIndexTitle}>目次</span>
      <ol className={styles.postIndexOl}>
        {formattedPostIndex.map((level1) => (
          <li
            key={`${level1.level}-${level1.title}`}
            className={styles.firstIndex}
          >
            <a href={`#${level1.title}`} className={styles.indexLink}>
              {level1.title}
            </a>

            {level1.child.length !== 0 && (
              <ol className={styles.subIndexOl}>
                {level1.child.map((level2) => (
                  <li
                    key={`${level2.level}-${level2.title}`}
                    className={styles.secondIndex}
                  >
                    <a href={`#${level2.title}`} className={styles.indexLink}>
                      {level2.title}
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
