import { Button } from '@blog/components/atoms/Button';
import { Category } from '@blog/types/entry';
import styles from './index.module.css';
import React from 'react';

export type CategoryWithCount = {
  element: Category;
  count: number;
};

interface Props {
  categories: CategoryWithCount[];
}

export const CategoryArea: React.FC<Props> = ({ categories }) => {
  return (
    <nav>
      <ul className={styles.categories}>
        {categories.map((category) => (
          <li key={category.element.slug}>
            <Button
              href={`/category/${category.element.slug}/1`}
              outlined
              className={styles.categoryButton}
            >
              {category.element.name} ({category.count})
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
