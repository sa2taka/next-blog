import { Button } from '@blog/components/atoms/Button';
import { Category } from '@blog/types/entry';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React from 'react';

export type CategoryWithCount = {
  element: Category;
  count: number;
};

interface Props {
  categories: CategoryWithCount[];
}

const Categories = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
`;

const categoryButton = css`
  margin: 0.5em 8px;
  padding: 0 8px;
`;

export const CategoryArea: React.FC<Props> = ({ categories }) => {
  return (
    <nav>
      <Categories>
        {categories.map((category) => (
          <li key={category.element.slug}>
            <Button
              href={`/category/${category.element.slug}/1`}
              outlined
              className={categoryButton}
            >
              {category.element.name} ({category.count})
            </Button>
          </li>
        ))}
      </Categories>
    </nav>
  );
};
