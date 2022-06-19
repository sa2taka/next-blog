import { styled } from '@linaria/react';
import React from 'react';
import { useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@/components/atoms/Button';

interface Props {
  currentPage: number;
  limit: number;
  postsCount: number;
  baseUrl: string;
}
const Padding = styled.div`
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
      font-size: 0.8rem !important;
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
          <li>
            <Button icon small href={generatePageLink(currentPage - 1)}>
              <FontAwesomeIcon icon={'chevron-left'} />
            </Button>
          </li>
        ) : (
          <Padding />
        )}
        {pages.map((page) => (
          <li key={page}>
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
          <li>
            <Button icon small href={generatePageLink(currentPage + 1)}>
              <FontAwesomeIcon icon={'chevron-right'} />
            </Button>
          </li>
        ) : (
          <Padding />
        )}
      </Pagination>
    </nav>
  );
};
