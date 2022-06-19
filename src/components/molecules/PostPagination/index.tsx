import React from 'react';

interface Props {
  currentPage: number;
  limit: number;
  postsCount: number;
}

export const PostPagination: React.FC<Props> = (props) => {
  return (
    <nav aria-label="ページネーションナビゲーション">
      <ul>
        <li></li>
      </ul>
    </nav>
  );
};
