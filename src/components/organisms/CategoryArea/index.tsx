import { Button } from '@/components/atoms/Button';
import { Category } from '@/types/entry';
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
          <li key={category.element.sys.id}>
            <Button
              href={`/category/${category.element.fields.slug}/1`}
              outlined
              className={categoryButton}
            >
              {category.element.fields.name} ({category.count})
            </Button>
          </li>
        ))}
      </Categories>
    </nav>
  );
};
