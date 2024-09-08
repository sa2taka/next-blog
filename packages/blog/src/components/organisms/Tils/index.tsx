import { TilWithRawHtml } from '@blog/types/entry';
import React from 'react';
import { TilItem } from './TilItem';
import styles from './index.module.css';

interface TilsProps {
  tils: TilWithRawHtml[];
}

export const Tils: React.FC<TilsProps> = ({ tils }) => {
  return (
    <ul className={styles.tilsUl}>
      {tils.map((til) => (
        <TilItem til={til} key={til.slug} />
      ))}
    </ul>
  );
};
