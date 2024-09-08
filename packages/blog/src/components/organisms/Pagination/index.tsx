import React from 'react';
import { useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@blog/components/atoms/Button';
import styles from './index.module.css';

interface Props {
  currentPage: number;
  limit: number;
  postsCount: number;
  baseUrl: string;
}

export const Pagination: React.FC<Props> = ({
  currentPage,
  limit,
  postsCount,
  baseUrl,
}) => {
  const maxPage = useMemo(
    () => Math.ceil(postsCount / limit),
    [limit, postsCount]
  );
  const isFirstPage = useMemo(() => currentPage === 1, [currentPage]);
  const isLastPage = useMemo(
    () => currentPage === maxPage,
    [currentPage, maxPage]
  );
  const pages = useMemo(
    () =>
      Array(maxPage)
        .fill(undefined)
        .map((_, i) => i + 1),
    [maxPage]
  );

  const generatePageLink = useCallback(
    (page: number) => {
      const formattedUrl =
        baseUrl === '' || baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
      return formattedUrl + page.toString();
    },
    [baseUrl]
  );

  return (
    <nav aria-label="ページネーションナビゲーション">
      <ul className={styles.paginationList}>
        {!isFirstPage ? (
          <li className={styles.paginationItem}>
            <Button icon xSmall href={generatePageLink(currentPage - 1)}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
          </li>
        ) : (
          <li className={styles.paginationItem} aria-label="empty area" />
        )}
        {pages.map((page) => (
          <li key={page} className={styles.paginationItem}>
            <Button
              icon
              outlined
              small
              disabled={page === currentPage}
              href={generatePageLink(page)}
            >
              {page}
            </Button>
          </li>
        ))}

        {!isLastPage ? (
          <li className={styles.paginationItem}>
            <Button icon xSmall href={generatePageLink(currentPage + 1)}>
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </li>
        ) : (
          <li className={styles.paginationItem} aria-label="empty area" />
        )}
      </ul>
    </nav>
  );
};
