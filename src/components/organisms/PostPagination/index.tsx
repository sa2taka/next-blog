import { styled } from '@linaria/react';
import React from 'react';
import { useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/atoms/Button';

interface Props {
  currentPage: number;
  limit: number;
  postsCount: number;
  baseUrl: string;
}
const PaginationItem = styled.li`
  width: 32px;
`;
const Pagination = styled.ul`
  align-items: center;
  display: inline-flex;
  list-style-type: none;
  justify-content: center;
  margin: 0;
  max-width: 100%;
  width: 100%;
  padding: 0;

  & > li {
    margin: 0 4px;

    & > a {
      font-size: 14px;
    }
  }
`;

export const PostPagination: React.FC<Props> = ({
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
      <Pagination>
        {!isFirstPage ? (
          <PaginationItem>
            <Button icon xSmall href={generatePageLink(currentPage - 1)}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem aria-label="empty area" />
        )}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <Button
              icon
              outlined
              small
              disabled={page === currentPage}
              href={generatePageLink(page)}
            >
              {page}
            </Button>
          </PaginationItem>
        ))}

        {!isLastPage ? (
          <PaginationItem>
            <Button icon xSmall href={generatePageLink(currentPage + 1)}>
              <FontAwesomeIcon icon={faChevronRight} />
            </Button>
          </PaginationItem>
        ) : (
          <PaginationItem aria-label="empty area" />
        )}
      </Pagination>
    </nav>
  );
};
